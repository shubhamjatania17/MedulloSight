"""
Operation 8: Otsu Global Thresholding
Computes 256-bin global Otsu binarization to maximize inter-class variance.
Compares dynamically computed threshold against observed range (51-109).
"""

from typing import Dict, Any
import numpy as np


def otsu_thresholding(gray_img: np.ndarray) -> Dict[str, Any]:
    """
    Computes optimal 256-bin Otsu threshold and binary segmentation mask.

    Args:
        gray_img: 2D uint8 NumPy ndarray.

    Returns:
        Dict containing threshold, binary_mask, foreground_percent,
        histogram, and reference context.
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")

    # 256-bin histogram
    hist, _ = np.histogram(
        gray_img.ravel(), bins=256, range=[0, 256]
    )
    total_pixels = gray_img.size

    # Normalized histogram probabilities
    prob = hist.astype(np.float64) / total_pixels
    omega = np.cumsum(prob)
    mu = np.cumsum(prob * np.arange(256))
    mu_total = mu[-1]

    # Maximize between-class variance sigma_b^2:
    # sigma_b^2(t) = (mu_total * omega(t) - mu(t))^2 /
    #                (omega(t) * (1 - omega(t)))
    denom = omega * (1.0 - omega)
    numerator = (mu_total * omega - mu) ** 2

    # Avoid division by zero
    valid = denom > 0
    sigma_b_squared = np.zeros(256, dtype=np.float64)
    sigma_b_squared[valid] = numerator[valid] / denom[valid]

    # Find maximum between-class variance; if plateau exists, use midpoint
    max_val = np.max(sigma_b_squared)
    if max_val > 0:
        max_indices = np.where(sigma_b_squared >= max_val - 1e-7)[0]
        optimal_threshold = int(np.mean(max_indices))
    else:
        optimal_threshold = 0

    # Binary mask: foreground for intensities strictly above threshold
    binary_mask = np.where(
        gray_img > optimal_threshold, 255, 0
    ).astype(np.uint8)
    foreground_pixels = int(np.count_nonzero(binary_mask))
    foreground_percent = float((foreground_pixels / total_pixels) * 100.0)

    return {
        "threshold": optimal_threshold,
        "binary_mask": binary_mask,
        "foreground_percent": foreground_percent,
        "foreground_pixels": foreground_pixels,
        "total_pixels": total_pixels,
        "histogram": hist.tolist(),
        "observed_min_ref": 51,
        "observed_max_ref": 109,
        "within_observed_range": bool(51 <= optimal_threshold <= 109)
    }
