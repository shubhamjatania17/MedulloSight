"""
Operation 3: Power-Law / Gamma Transformation
Formula: s = c * (r ^ gamma)
Gamma < 1.0 brightens darker tissue; Gamma > 1.0 suppresses bright
intensities.
"""

import numpy as np


def gamma_transformation(
    gray_img: np.ndarray,
    gamma: float = 0.5,
    c: float = 1.0
) -> np.ndarray:
    """
    Applies power-law (gamma) intensity transformation.

    Args:
        gray_img: 2D uint8 NumPy ndarray.
        gamma: Exponent parameter (research defaults: 0.5 or 1.5).
        c: Scaling constant (default: 1.0).

    Returns:
        2D uint8 NumPy ndarray.
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")

    # Normalize to [0.0, 1.0]
    norm = gray_img.astype(np.float64) / 255.0
    transformed = c * np.power(norm, gamma)
    scaled = np.clip(transformed * 255.0, 0, 255).astype(np.uint8)
    return scaled
