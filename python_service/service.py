"""
MedulloSight — Python Scientific Image-Processing Microservice
Exposes REST endpoints via FastAPI for classical MRI pipeline execution,
metrics computation, noise benchmarking, and ReportLab PDF report generation.
"""

import base64
import io
import os
import time
import uuid
from pathlib import Path
import numpy as np
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from config import (
    CONTRAST_LOW_PERCENTILE,
    CONTRAST_HIGH_PERCENTILE,
    GAMMA_DEFAULT,
    BUTTERWORTH_LPF_D0,
    BUTTERWORTH_ORDER,
    MEDIAN_KERNEL_SIZE,
    MORPHOLOGY_DISK_RADIUS_SMALL,
    MORPHOLOGY_DISK_RADIUS_LARGE
)
from pipeline import (
    run_classical_pipeline,
    inject_synthetic_noise,
    apply_median_filter,
    to_grayscale
)
from metrics import (
    compute_intensity_metrics,
    compute_mse_psnr,
    compute_segmentation_metrics,
    detect_pipeline_anomalies
)
from reports import generate_pdf_report
from utils import array_to_base64_png, bytes_to_numpy
from ml.inference import predict
from ml.features import prepare_image
from storage import save_case, connection
from research_api import router as research_router, image_bytes

app = FastAPI(
    title="MedulloSight Scientific Image Processing Service",
    description=(
        "Medulloblastoma-focused classical SIP and experimental ML analysis "
        "for MRI slices."
    ),
    version="2.0.0"
)
app.include_router(research_router)

# Enable CORS for local Express server and React client
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("MEDULLOSIGHT_ALLOWED_ORIGINS", "http://127.0.0.1:5000,http://localhost:5000,http://127.0.0.1:5173,http://localhost:5173").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint for service availability monitoring."""
    with connection() as db:
        db.execute("SELECT 1").fetchone()
    return {
        "status": "healthy",
        "service": "MedulloSight Scientific Engine",
        "version": "2.0.0",
        "storage": "sqlite",
        "ml_available": (Path(__file__).parent / "artifacts/classifiers.joblib").exists(),
        "timestamp": time.time()
    }


@app.get("/samples")
def list_samples():
    """Returns metadata for built-in benchmark MRI slices."""
    samples_dir = os.path.join(os.path.dirname(__file__), "samples")
    samples = []
    if os.path.exists(samples_dir):
        for f in sorted(os.listdir(samples_dir)):
            f_lower = f.lower()
            if f_lower.endswith((".png", ".jpg", ".jpeg")):
                if "t1c" in f_lower or "t1_contrast" in f_lower:
                    seq = "T1C+"
                elif "t1" in f_lower:
                    seq = "T1"
                elif "t2" in f_lower:
                    seq = "T2"
                else:
                    seq = "Unknown"
                samples.append({
                    "id": f,
                    "filename": f,
                    "sequence": seq,
                    "path": f"/samples/{f}"
                })
    return {"samples": samples}


@app.post("/process")
def process_image(
    file: UploadFile = File(...),
    sequence: str = Form("Unknown", pattern="^(T1|T1C\\+|T2|Unknown)$"),
    contrast_low_p: float = Form(CONTRAST_LOW_PERCENTILE, ge=0, le=10),
    contrast_high_p: float = Form(CONTRAST_HIGH_PERCENTILE, ge=90, le=100),
    gamma: float = Form(GAMMA_DEFAULT, ge=.1, le=3),
    butterworth_d0: float = Form(BUTTERWORTH_LPF_D0, ge=1, le=200),
    butterworth_order: int = Form(BUTTERWORTH_ORDER, ge=1, le=6),
    median_kernel: int = Form(MEDIAN_KERNEL_SIZE, ge=3, le=7),
    morph_radius_small: int = Form(MORPHOLOGY_DISK_RADIUS_SMALL, ge=1, le=9),
    morph_radius_large: int = Form(MORPHOLOGY_DISK_RADIUS_LARGE, ge=1, le=15),
    pipeline_mode: str = Form("notebook-v1", pattern="^(notebook-v1|experimental-v2)$"),
    persist: bool = Form(True),
    include_ml: bool = Form(True)
):
    """
    Executes 10-step classical image processing pipeline on an MRI slice.
    """
    try:
        content = file.file.read()
        raw_arr = bytes_to_numpy(content)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to decode image file: {str(e)}"
        ) from e

    h, w = raw_arr.shape[:2]
    if median_kernel not in {3, 5, 7} or contrast_low_p >= contrast_high_p:
        raise HTTPException(422, "Use an odd median kernel (3, 5, 7) and ordered contrast percentiles")
    channels = 1 if raw_arr.ndim == 2 else raw_arr.shape[2]

    # Execute full pipeline
    results = run_classical_pipeline(
        raw_img=raw_arr,
        sequence=sequence,
        contrast_low_p=contrast_low_p,
        contrast_high_p=contrast_high_p,
        gamma=gamma,
        butterworth_d0=butterworth_d0,
        butterworth_order=butterworth_order,
        median_kernel=median_kernel,
        morph_radius_small=morph_radius_small,
        morph_radius_large=morph_radius_large,
        pipeline_mode=pipeline_mode
    )

    step_arrays = results["step_arrays"]

    # Calculate Quantitative Metrics
    initial_metrics = compute_intensity_metrics(step_arrays["grayscale"])
    stretched_metrics = compute_intensity_metrics(
        step_arrays["contrast_stretched"]
    )
    seg_metrics = compute_segmentation_metrics(
        results["otsu_results"],
        results["morphology_results"],
        results["roi_results"]
    )

    # Anomaly & T1 Failure Detection
    cc_opened = (
        results["morphology_results"]["opening_closing"]["cc_opened"]
    )
    warnings = detect_pipeline_anomalies(
        sequence=sequence,
        otsu_threshold=results["otsu_results"]["threshold"],
        foreground_percent=results["otsu_results"]["foreground_percent"],
        candidate_mask=step_arrays["candidate_mask"],
        roi_area_percent=results["roi_results"]["roi_area_percent"],
        cc_count_opened=cc_opened
    )

    # Convert all intermediate NumPy arrays to Base64 PNGs for JSON transport
    step_images_b64 = {
        "raw": array_to_base64_png(raw_arr),
        "grayscale": array_to_base64_png(step_arrays["grayscale"]),
        "contrast_stretched": array_to_base64_png(
            step_arrays["contrast_stretched"]
        ),
        "gamma": array_to_base64_png(step_arrays["gamma"]),
        "histogram_equalized": array_to_base64_png(
            step_arrays["histogram_equalized"]
        ),
        "median": array_to_base64_png(step_arrays["median"]),
        "fft_spectrum": array_to_base64_png(step_arrays["fft_spectrum"]),
        "butterworth_lpf": array_to_base64_png(
            step_arrays["butterworth_lpf"]
        ),
        "butterworth_hpf": array_to_base64_png(
            step_arrays["butterworth_hpf"]
        ),
        "filter_response_lpf": array_to_base64_png(
            step_arrays["filter_response_lpf"]
        ),
        "edge_sobel": array_to_base64_png(step_arrays["edge_sobel"]),
        "edge_roberts": array_to_base64_png(step_arrays["edge_roberts"]),
        "edge_prewitt": array_to_base64_png(step_arrays["edge_prewitt"]),
        "edge_laplacian": array_to_base64_png(
            step_arrays["edge_laplacian"]
        ),
        "edge_sobel_binary": array_to_base64_png(
            step_arrays["edge_sobel_binary"]
        ),
        "otsu_mask": array_to_base64_png(step_arrays["otsu_mask"]),
        "eroded_mask": array_to_base64_png(step_arrays["eroded_mask"]),
        "dilated_mask": array_to_base64_png(step_arrays["dilated_mask"]),
        "opened_mask": array_to_base64_png(step_arrays["opened_mask"]),
        "closed_mask": array_to_base64_png(step_arrays["closed_mask"]),
        "candidate_mask": array_to_base64_png(
            step_arrays["candidate_mask"]
        ),
        "overlay_image": array_to_base64_png(step_arrays["overlay_image"])
    }

    response = {
        "sessionId": str(uuid.uuid4()),
        "pipeline_version": pipeline_mode,
        "filename": file.filename,
        "sequence": sequence,
        "dimensions": {"width": w, "height": h, "channels": channels},
        "total_duration_ms": results["total_duration_ms"],
        "steps_log": results["steps_log"],
        "parameters": results["parameters"],
        "metrics": {
            "initial_mean": initial_metrics["mean"],
            "initial_std": initial_metrics["std"],
            "stretched_std": stretched_metrics["std"],
            "entropy": initial_metrics["entropy"],
            "otsu_threshold": results["otsu_results"]["threshold"],
            "foreground_percent": (
                results["otsu_results"]["foreground_percent"]
            ),
            "cc_count_before_open": seg_metrics["cc_count_before_open"],
            "cc_count_after_open": seg_metrics["cc_count_after_open"],
            "cc_reduction_percent": seg_metrics["cc_reduction_percent"],
            "has_candidate": seg_metrics["has_candidate"],
            "roi_area_pixels": seg_metrics["roi_area_pixels"],
            "roi_area_percent": seg_metrics["roi_area_percent"],
            "roi_bbox": seg_metrics["roi_bbox"],
            "centroid": seg_metrics["centroid"],
            "initial_metrics": initial_metrics,
            "stretched_metrics": stretched_metrics
        },
        "histogram_data": {
            "raw": results["otsu_results"]["histogram"],
            "otsu_threshold": results["otsu_results"]["threshold"]
        },
        "warnings": warnings,
        "step_images": step_images_b64
    }
    response["metrics"]["contrast_gain_percent"] = round(100 * (stretched_metrics["std"] / initial_metrics["std"] - 1), 2) if initial_metrics["std"] else None
    response["histogram_data"]["raw"] = np.histogram(step_arrays["grayscale"], bins=256, range=(0,256))[0].tolist()
    response["histogram_data"]["segmentation_input"] = results["otsu_results"]["histogram"]
    response["ml"] = predict(raw_arr) if include_ml else {"status":"skipped", "predictions":[]}
    response["step_images"]["ml_raw"] = array_to_base64_png(prepare_image(raw_arr, "raw"))
    response["step_images"]["ml_sip"] = array_to_base64_png(prepare_image(raw_arr, "sip"))
    return save_case(response) if persist else response


class ReportRequest(BaseModel):
    """Schema for PDF report compilation payload."""
    filename: str
    sequence: str = "Unknown"
    dimensions: Dict[str, int]
    total_duration_ms: float
    parameters: Dict[str, Any]
    metrics: Dict[str, Any]
    warnings: List[Dict[str, str]] = []
    step_images_b64: Dict[str, str]
    ml: Dict[str, Any] = {}
    notes: str = ""
    pipeline_version: str = "notebook-v1"


@app.post("/report/pdf")
def create_pdf_report_endpoint(req: ReportRequest):
    """
    Generates and returns an A4 research report PDF via ReportLab.
    """
    try:
        # Decode base64 images to PIL images for ReportLab embedding
        step_pil_images = {}
        target_keys = [
            "raw",
            "contrast_stretched",
            "butterworth_lpf",
            "edge_sobel",
            "otsu_mask",
            "overlay_image"
        ]
        for key in target_keys:
            b64_str = req.step_images_b64.get(key)
            if b64_str:
                if "," in b64_str:
                    b64_str = b64_str.split(",")[1]
                im_bytes = base64.b64decode(b64_str)
                step_pil_images[key] = Image.open(
                    io.BytesIO(im_bytes)
                ).convert("RGB")

        session_data = {
            "filename": req.filename,
            "sequence": req.sequence,
            "dimensions": req.dimensions,
            "total_duration_ms": req.total_duration_ms,
            "parameters": req.parameters,
            "metrics": req.metrics,
            "warnings": req.warnings,
            "step_pil_images": step_pil_images
        }
        session_data.update(ml=req.ml, notes=req.notes, pipeline_version=req.pipeline_version)

        pdf_bytes = generate_pdf_report(session_data)
        out_filename = (
            f"MedulloSight_Report_{req.sequence}_{int(time.time())}.pdf"
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={out_filename}"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate PDF: {str(e)}"
        ) from e


@app.post("/benchmark/noise")
def benchmark_noise_endpoint(
    file: UploadFile = File(...),
    density: float = Form(0.05, ge=0.001, le=0.3)
):
    """
    Injects synthetic impulse noise and evaluates median filter performance.
    """
    try:
        content = file.file.read()
        raw_arr = bytes_to_numpy(content)
        gray = to_grayscale(raw_arr)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid image: {str(e)}"
        ) from e

    noisy = inject_synthetic_noise(gray, density=density)
    filtered = apply_median_filter(noisy, kernel_size=3)

    metrics_noisy = compute_mse_psnr(gray, noisy)
    metrics_filtered = compute_mse_psnr(gray, filtered)

    p_filt = metrics_filtered["psnr"]
    p_noisy = metrics_noisy["psnr"]
    improvement = round(p_filt - p_noisy, 2) if p_filt is not None and p_noisy is not None else None

    return {
        "density": density,
        "clean_image": array_to_base64_png(gray),
        "noisy_image": array_to_base64_png(noisy),
        "filtered_image": array_to_base64_png(filtered),
        "noisy_metrics": metrics_noisy,
        "filtered_metrics": metrics_filtered,
        "psnr_improvement_db": improvement
    }


class CohortAnalysis(BaseModel):
    image_id: str
    pipeline_mode: str = "notebook-v1"


@app.post("/analyze/cohort")
def analyze_cohort(req: CohortAnalysis):
    content, record = image_bytes(req.image_id)
    if req.pipeline_mode not in {"notebook-v1", "experimental-v2"}:
        raise HTTPException(422, "Unknown pipeline mode")
    file = UploadFile(filename=record["path"].rsplit("/",1)[-1], file=io.BytesIO(content))
    result = process_image(file, record["sequence"], 1., 99., .5, 50., 2, 3, 3, 7, req.pipeline_mode, False, True)
    result["source"] = {"cohort_id":req.image_id, "dataset_label":record["disease"], "split":record["split"]}
    return save_case(result)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("service:app", host="127.0.0.1", port=8000, reload=True)
