"""
Operation 1: Grayscale Conversion
Formula: Y = 0.2989*R + 0.5870*G + 0.1140*B (ITU-R BT.601)
Preserves native single-channel arrays if already grayscale.
"""

import numpy as np


def to_grayscale(img: np.ndarray) -> np.ndarray:
    """
    Converts an input image array to a uint8 2D grayscale array.

    Args:
        img: NumPy ndarray of shape (H, W) or (H, W, 3/4).

    Returns:
        2D uint8 NumPy ndarray of shape (H, W) in range [0, 255].
    """
    if img.ndim == 2:
        # Already single channel
        if img.dtype == np.uint8:
            return img.copy()
        if np.issubdtype(img.dtype, np.floating):
            if img.max() <= 1.0:
                norm = np.clip(img, 0.0, 1.0)
            else:
                norm = np.clip(img / 255.0, 0.0, 1.0)
            return (norm * 255.0).astype(np.uint8)
        return np.clip(img, 0, 255).astype(np.uint8)

    if img.ndim == 3:
        # Check channels
        num_channels = img.shape[2]
        if num_channels >= 3:
            r = img[:, :, 0].astype(np.float64)
            g = img[:, :, 1].astype(np.float64)
            b = img[:, :, 2].astype(np.float64)
            # ITU-R BT.601 luminance coefficients
            gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
            return np.clip(gray, 0, 255).astype(np.uint8)
        elif num_channels == 1:
            return np.clip(img[:, :, 0], 0, 255).astype(np.uint8)

    raise ValueError(f"Unsupported image dimensions: shape={img.shape}")
