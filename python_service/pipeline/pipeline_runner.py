"""
MedulloSight — Pipeline Runner
Orchestrates sequential execution of all 10 classical operations,
computes intermediate image representations, and tracks execution timings.
"""

import time
from typing import Dict, Any
import numpy as np

from config import (
    CONTRAST_LOW_PERCENTILE,
    CONTRAST_HIGH_PERCENTILE,
    GAMMA_DEFAULT,
    GAMMA_C,
    MEDIAN_KERNEL_SIZE,
    BUTTERWORTH_LPF_D0,
    BUTTERWORTH_HPF_D0,
    BUTTERWORTH_ORDER,
    MORPHOLOGY_DISK_RADIUS_SMALL,
    MORPHOLOGY_DISK_RADIUS_LARGE,
    CONNECTIVITY
)
from .grayscale import to_grayscale
from .enhancement import contrast_stretching
from .gamma import gamma_transformation
from .histogram import histogram_equalization
from .denoising import apply_median_filter
from .butterworth import butterworth_filter
from .edges import edge_detection_suite
from .thresholding import otsu_thresholding
from .morphology import apply_erosion_dilation, apply_opening_closing
from .roi import extract_candidate_roi


def run_classical_pipeline(
    raw_img: np.ndarray,
    sequence: str = "Unknown",
    contrast_low_p: float = CONTRAST_LOW_PERCENTILE,
    contrast_high_p: float = CONTRAST_HIGH_PERCENTILE,
    gamma: float = GAMMA_DEFAULT,
    butterworth_d0: float = BUTTERWORTH_LPF_D0,
    butterworth_order: int = BUTTERWORTH_ORDER,
    median_kernel: int = MEDIAN_KERNEL_SIZE,
    morph_radius_small: int = MORPHOLOGY_DISK_RADIUS_SMALL,
    morph_radius_large: int = MORPHOLOGY_DISK_RADIUS_LARGE
) -> Dict[str, Any]:
    """
    Executes the complete MedulloSight 10-operation pipeline.

    Returns:
        Structured dictionary containing all intermediate image arrays,
        metrics, timing profiles, and candidate ROI.
    """
    start_total_time = time.perf_counter()
    steps_log = []

    # --- Step 1: Grayscale Conversion ---
    t0 = time.perf_counter()
    gray_img = to_grayscale(raw_img)
    t1 = time.perf_counter()
    steps_log.append({
        "step": 1,
        "name": "Grayscale Conversion",
        "stage": "Stage A — Spatial-Domain Enhancement",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 2: Contrast Stretching ---
    t0 = time.perf_counter()
    stretched_img, _, _ = contrast_stretching(
        gray_img,
        low_percentile=contrast_low_p,
        high_percentile=contrast_high_p
    )
    t1 = time.perf_counter()
    steps_log.append({
        "step": 2,
        "name": "Contrast Stretching (1st-99th Percentile)",
        "stage": "Stage A — Spatial-Domain Enhancement",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 3: Gamma Transformation ---
    t0 = time.perf_counter()
    gamma_img = gamma_transformation(stretched_img, gamma=gamma, c=GAMMA_C)
    t1 = time.perf_counter()
    steps_log.append({
        "step": 3,
        "name": "Power-Law / Gamma Transformation",
        "stage": "Stage A — Spatial-Domain Enhancement",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 4: Histogram Equalization ---
    t0 = time.perf_counter()
    eq_img, _, _ = histogram_equalization(gamma_img)
    t1 = time.perf_counter()
    steps_log.append({
        "step": 4,
        "name": "Histogram Equalization",
        "stage": "Stage A — Spatial-Domain Enhancement",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 5: Median Filtering ---
    t0 = time.perf_counter()
    # Apply median filtering on the contrast-stretched & gamma enhanced image
    median_img = apply_median_filter(gamma_img, kernel_size=median_kernel)
    t1 = time.perf_counter()
    steps_log.append({
        "step": 5,
        "name": "Median Filtering (3x3 Kernel)",
        "stage": "Stage A — Spatial-Domain Enhancement",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 6: Frequency-Domain Butterworth Filtering ---
    t0 = time.perf_counter()
    bw_lpf, spectrum_img, filter_resp_lpf = butterworth_filter(
        median_img,
        filter_type="lowpass",
        d0=butterworth_d0,
        order=butterworth_order
    )
    bw_hpf, _, _ = butterworth_filter(
        median_img,
        filter_type="highpass",
        d0=BUTTERWORTH_HPF_D0,
        order=butterworth_order
    )
    t1 = time.perf_counter()
    steps_log.append({
        "step": 6,
        "name": "Butterworth Filtering (2D FFT)",
        "stage": "Stage B — Frequency Domain & Edges",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 7: Edge Detection Suite ---
    t0 = time.perf_counter()
    edge_results = edge_detection_suite(median_img)
    t1 = time.perf_counter()
    steps_log.append({
        "step": 7,
        "name": "Edge Detection (Sobel, Roberts, Prewitt, Laplacian)",
        "stage": "Stage B — Frequency Domain & Edges",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 8: Otsu Thresholding ---
    t0 = time.perf_counter()
    otsu_res = otsu_thresholding(bw_lpf)
    t1 = time.perf_counter()
    steps_log.append({
        "step": 8,
        "name": "Otsu Global Thresholding",
        "stage": "Stage C — Segmentation & Morphology",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 9: Morphological Erosion & Dilation ---
    t0 = time.perf_counter()
    erod_dil_res = apply_erosion_dilation(
        otsu_res["binary_mask"], radius=morph_radius_small
    )
    t1 = time.perf_counter()
    steps_log.append({
        "step": 9,
        "name": "Morphological Erosion / Dilation",
        "stage": "Stage C — Segmentation & Morphology",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Step 10: Morphological Opening & Closing ---
    t0 = time.perf_counter()
    open_close_res = apply_opening_closing(
        otsu_res["binary_mask"],
        radius=morph_radius_large,
        connectivity=CONNECTIVITY
    )
    t1 = time.perf_counter()
    steps_log.append({
        "step": 10,
        "name": "Morphological Opening / Closing",
        "stage": "Stage C — Segmentation & Morphology",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    # --- Final Candidate ROI Extraction ---
    t0 = time.perf_counter()
    roi_res = extract_candidate_roi(
        open_close_res["closed_mask"],
        raw_img=raw_img,
        connectivity=CONNECTIVITY
    )
    t1 = time.perf_counter()
    steps_log.append({
        "step": 11,
        "name": "Candidate ROI Extraction & Overlay",
        "stage": "Stage C — Segmentation & Morphology",
        "duration_ms": round((t1 - t0) * 1000, 2),
        "status": "Completed"
    })

    elapsed = (time.perf_counter() - start_total_time) * 1000
    total_duration_ms = round(elapsed, 2)

    return {
        "raw_img": raw_img,
        "sequence": sequence,
        "total_duration_ms": total_duration_ms,
        "steps_log": steps_log,
        "step_arrays": {
            "grayscale": gray_img,
            "contrast_stretched": stretched_img,
            "gamma": gamma_img,
            "histogram_equalized": eq_img,
            "median": median_img,
            "fft_spectrum": spectrum_img,
            "butterworth_lpf": bw_lpf,
            "butterworth_hpf": bw_hpf,
            "filter_response_lpf": filter_resp_lpf,
            "edge_sobel": edge_results["sobel"]["gradient_map"],
            "edge_roberts": edge_results["roberts"]["gradient_map"],
            "edge_prewitt": edge_results["prewitt"]["gradient_map"],
            "edge_laplacian": edge_results["laplacian"]["gradient_map"],
            "edge_sobel_binary": edge_results["sobel"]["binary_mask"],
            "otsu_mask": otsu_res["binary_mask"],
            "eroded_mask": erod_dil_res["eroded_mask"],
            "dilated_mask": erod_dil_res["dilated_mask"],
            "opened_mask": open_close_res["opened_mask"],
            "closed_mask": open_close_res["closed_mask"],
            "candidate_mask": roi_res["candidate_mask"],
            "overlay_image": roi_res["overlay_image"]
        },
        "otsu_results": otsu_res,
        "morphology_results": {
            "erosion_dilation": erod_dil_res,
            "opening_closing": open_close_res
        },
        "edge_results": edge_results,
        "roi_results": roi_res,
        "parameters": {
            "contrast_low_p": contrast_low_p,
            "contrast_high_p": contrast_high_p,
            "gamma": gamma,
            "butterworth_d0": butterworth_d0,
            "butterworth_order": butterworth_order,
            "median_kernel": median_kernel,
            "morph_radius_small": morph_radius_small,
            "morph_radius_large": morph_radius_large
        }
    }
