"""
MedulloSight — Image Intensity & Statistical Metrics
Computes mean, median, standard deviation, dynamic range, and Shannon entropy.
"""

from typing import Dict
import numpy as np


def compute_intensity_metrics(gray_img: np.ndarray) -> Dict[str, float]:
    """
    Computes statistical distribution metrics for a 2D grayscale image.

    Args:
        gray_img: 2D uint8 NumPy ndarray.

    Returns:
        Dict with mean, median, std, min, max, dynamic_range, and entropy.
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")

    arr = gray_img.astype(np.float64)
    mean_val = float(np.mean(arr))
    median_val = float(np.median(arr))
    std_val = float(np.std(arr))
    min_val = float(np.min(arr))
    max_val = float(np.max(arr))
    dyn_range = float(max_val - min_val)

    # Shannon Entropy: H = - sum(p * log2(p))
    hist, _ = np.histogram(gray_img.flatten(), bins=256, range=[0, 256])
    total = gray_img.size
    p = hist.astype(np.float64) / total
    p_nonzero = p[p > 0]
    entropy_val = float(-np.sum(p_nonzero * np.log2(p_nonzero)))

    return {
        "mean": round(mean_val, 2),
        "median": round(median_val, 2),
        "std": round(std_val, 2),
        "min": round(min_val, 2),
        "max": round(max_val, 2),
        "dynamic_range": round(dyn_range, 2),
        "entropy": round(entropy_val, 3)
    }
