"""
MedulloSight classical image processing pipeline package.
"""
from .grayscale import to_grayscale
from .enhancement import contrast_stretching
from .gamma import gamma_transformation
from .histogram import histogram_equalization
from .denoising import apply_median_filter, inject_synthetic_noise
from .butterworth import butterworth_filter, compute_fft_spectrum
from .edges import edge_detection_suite, compute_sobel_edges
from .thresholding import otsu_thresholding
from .morphology import apply_erosion_dilation, apply_opening_closing
from .roi import extract_candidate_roi
from .pipeline_runner import run_classical_pipeline

__all__ = [
    "to_grayscale",
    "contrast_stretching",
    "gamma_transformation",
    "histogram_equalization",
    "apply_median_filter",
    "inject_synthetic_noise",
    "butterworth_filter",
    "compute_fft_spectrum",
    "edge_detection_suite",
    "compute_sobel_edges",
    "otsu_thresholding",
    "apply_erosion_dilation",
    "apply_opening_closing",
    "extract_candidate_roi",
    "run_classical_pipeline"
]
