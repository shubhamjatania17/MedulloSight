"""
Operation 4: Histogram Equalization
Spreads out the most frequent intensity values across 256 discrete gray
levels using the CDF.
"""

from typing import Tuple, List
import numpy as np


def histogram_equalization(
    gray_img: np.ndarray
) -> Tuple[np.ndarray, List[int], List[int]]:
    """
    Applies classical histogram equalization to a 2D grayscale image.

    Args:
        gray_img: 2D uint8 NumPy ndarray.

    Returns:
        Tuple of (equalized_img, original_hist, equalized_hist)
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")

    # Compute original 256-bin histogram
    orig_hist, _ = np.histogram(gray_img.flatten(), bins=256, range=[0, 256])

    # Cumulative distribution function (CDF)
    cdf = orig_hist.cumsum()
    cdf_masked = np.ma.masked_equal(cdf, 0)

    # Scale CDF to [0, 255]
    if cdf_masked.max() == cdf_masked.min():
        equalized = gray_img.copy()
    else:
        num = (cdf_masked - cdf_masked.min()) * 255
        denom = cdf_masked.max() - cdf_masked.min()
        cdf_scaled = num / denom
        cdf_final = np.ma.filled(cdf_scaled, 0).astype(np.uint8)
        equalized = cdf_final[gray_img]

    eq_hist, _ = np.histogram(equalized.flatten(), bins=256, range=[0, 256])
    return equalized, orig_hist.tolist(), eq_hist.tolist()
