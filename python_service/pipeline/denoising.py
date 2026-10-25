"""
Operation 5: Median Filtering & Denoising
Applies a 3x3 median filter for spatial impulse noise suppression.
Includes an optional synthetic salt-and-pepper noise simulation
for research benchmarking.
"""

from typing import Optional
import numpy as np
from scipy.ndimage import median_filter


def apply_median_filter(
    gray_img: np.ndarray,
    kernel_size: int = 3
) -> np.ndarray:
    """
    Applies median filtering to suppress impulse and fine-grain noise.

    Args:
        gray_img: 2D uint8 NumPy ndarray.
        kernel_size: Window dimension (default: 3).

    Returns:
        Filtered 2D uint8 NumPy ndarray.
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")
    filtered = median_filter(gray_img, size=kernel_size)
    return filtered.astype(np.uint8)


def inject_synthetic_noise(
    gray_img: np.ndarray,
    density: float = 0.05,
    seed: Optional[int] = 42
) -> np.ndarray:
    """
    Generates synthetic salt-and-pepper noise strictly for controlled
    research benchmarking.

    Args:
        gray_img: 2D uint8 NumPy ndarray.
        density: Noise probability density (default: 0.05 per paper).
        seed: Random seed for reproducible evaluation.

    Returns:
        Noisy 2D uint8 NumPy ndarray.
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")

    rng = np.random.default_rng(seed)
    noisy = gray_img.copy()

    # Half salt, half pepper
    num_salt = int(np.ceil(density * gray_img.size * 0.5))
    num_pepper = int(np.ceil(density * gray_img.size * 0.5))

    # Salt (255)
    coords_salt = [rng.integers(0, i, num_salt) for i in gray_img.shape]
    noisy[tuple(coords_salt)] = 255

    # Pepper (0)
    coords_pepper = [rng.integers(0, i, num_pepper) for i in gray_img.shape]
    noisy[tuple(coords_pepper)] = 0

    return noisy
