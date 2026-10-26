"""
MedulloSight — Filtering Benchmarks (MSE & PSNR)
Only computed when a valid reference image exists
(e.g. synthetic noise evaluation).
"""

from typing import Dict, Optional
import numpy as np


def compute_mse_psnr(
    clean_ref: np.ndarray,
    test_img: np.ndarray,
    data_range: float = 255.0
) -> Dict[str, Optional[float]]:
    """
    Calculates Mean Squared Error (MSE) and Peak Signal-to-Noise Ratio (PSNR).

    Args:
        clean_ref: Ground-truth reference image (uint8 or float).
        test_img: Evaluated image (uint8 or float).
        data_range: Maximum possible pixel dynamic range (default: 255.0).

    Returns:
        Dict with mse and psnr values.
    """
    if clean_ref.shape != test_img.shape:
        return {"mse": None, "psnr": None}

    ref = clean_ref.astype(np.float64)
    target = test_img.astype(np.float64)

    mse = float(np.mean((ref - target) ** 2))
    if mse == 0:
        psnr = float("inf")
    else:
        psnr = float(10.0 * np.log10((data_range ** 2) / mse))

    return {
        "mse": round(mse, 3),
        "psnr": round(psnr, 2) if np.isfinite(psnr) else None,
        "exact_match": mse == 0
    }
