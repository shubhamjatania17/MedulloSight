"""
MedulloSight — Python Scientific Image-Processing Microservice
Exposes REST endpoints via FastAPI for classical MRI pipeline execution,
metrics computation, noise benchmarking, and ReportLab PDF report generation.
"""

import base64
import io
import os
import time
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

app = FastAPI(
    title="MedulloSight Scientific Image Processing Service",
    description=(
        "Classical, training-free medical image analysis pipeline "
        "for MRI slices."
    ),
    version="1.0.0"
)

# Enable CORS for local Express server and React client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint for service availability monitoring."""
    return {
        "status": "healthy",
        "service": "MedulloSight Scientific Engine",
        "version": "1.0.0",
        "timestamp": time.time()
    }


@app.get("/samples")
def list_samples():
    """Returns metadata for built-in benchmark MRI slices."""
    samples_dir = os.path.join(os.path.dirname(__file__), "samples")
    samples = []
    if os.path.exists(samples_dir):
        for f in os.listdir(samples_dir):
            if f.endswith(".png"):
                if "t1_" in f:
                    seq = "T1"
                elif "t1c_" in f:
                    seq = "T1C+"
                elif "t2_" in f:
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
async def process_image(
    file: UploadFile = File(...),
    sequence: str = Form("Unknown"),
    contrast_low_p: float = Form(CONTRAST_LOW_PERCENTILE),
    contrast_high_p: float = Form(CONTRAST_HIGH_PERCENTILE),
    gamma: float = Form(GAMMA_DEFAULT),
    butterworth_d0: float = Form(BUTTERWORTH_LPF_D0),
    butterworth_order: int = Form(BUTTERWORTH_ORDER),
    median_kernel: int = Form(MEDIAN_KERNEL_SIZE),
    morph_radius_small: int = Form(MORPHOLOGY_DISK_RADIUS_SMALL),
    morph_radius_large: int = Form(MORPHOLOGY_DISK_RADIUS_LARGE)
):
    """
    Executes 10-step classical image processing pipeline on an MRI slice.
    """
    try:
        content = await file.read()
        raw_arr = bytes_to_numpy(content)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to decode image file: {str(e)}"
        ) from e

    h, w = raw_arr.shape[:2]
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
        morph_radius_large=morph_radius_large
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

    return {
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


@app.post("/report/pdf")
async def create_pdf_report_endpoint(req: ReportRequest):
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
async def benchmark_noise_endpoint(
    file: UploadFile = File(...),
    density: float = Form(0.05)
):
    """
    Injects synthetic impulse noise and evaluates median filter performance.
    """
    try:
        content = await file.read()
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

    p_filt = metrics_filtered["psnr"] or 0
    p_noisy = metrics_noisy["psnr"] or 0
    improvement = round(p_filt - p_noisy, 2)

    return {
        "density": density,
        "clean_image": array_to_base64_png(gray),
        "noisy_image": array_to_base64_png(noisy),
        "filtered_image": array_to_base64_png(filtered),
        "noisy_metrics": metrics_noisy,
        "filtered_metrics": metrics_filtered,
        "psnr_improvement_db": improvement
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("service:app", host="127.0.0.1", port=8000, reload=True)
