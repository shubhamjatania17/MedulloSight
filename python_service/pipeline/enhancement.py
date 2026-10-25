"""
Operation 2: Contrast Stretching
Normalizes intensity spread using the 1st to 99th percentile range from
research methodology.
"""

from typing import Tuple
import numpy as np


def contrast_stretching(
    gray_img: np.ndarray,
    low_percentile: float = 1.0,
    high_percentile: float = 99.0
) -> Tuple[np.ndarray, float, float]:
    """
    Applies percentile-based contrast stretching to a 2D grayscale image.

    Args:
        gray_img: 2D uint8 NumPy ndarray.
        low_percentile: Lower percentile cutoff (default: 1.0).
        high_percentile: Upper percentile cutoff (default: 99.0).

    Returns:
        Tuple of (stretched_image, p_low_value, p_high_value)
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")

    p_low = float(np.percentile(gray_img, low_percentile))
    p_high = float(np.percentile(gray_img, high_percentile))

    if p_high <= p_low:
        # Uniform or degenerated image; avoid division by zero
        return gray_img.copy(), p_low, p_high

    # Scale intensities between p_low and p_high to [0, 255]
    clipped = np.clip(gray_img.astype(np.float64), p_low, p_high)
    stretched = ((clipped - p_low) / (p_high - p_low)) * 255.0
    return np.clip(stretched, 0, 255).astype(np.uint8), p_low, p_high
