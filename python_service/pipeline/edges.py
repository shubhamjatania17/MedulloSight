"""
Operation 7: Edge Detection & Boundary Analysis
Implements Sobel, Roberts, Prewitt, and Laplacian operators
with automated mu + 2*sigma thresholding.
"""

from typing import Dict, Tuple, Any
import numpy as np
from scipy.ndimage import convolve


def compute_roberts_edges(gray_img: np.ndarray) -> np.ndarray:
    """Roberts Cross gradient magnitude."""
    img_f = gray_img.astype(np.float64)
    # Roberts diagonal kernels
    kx = np.array([[1, 0], [0, -1]], dtype=np.float64)
    ky = np.array([[0, 1], [-1, 0]], dtype=np.float64)
    gx = convolve(img_f, kx)
    gy = convolve(img_f, ky)
    mag = np.hypot(gx, gy)
    return mag


def compute_prewitt_edges(gray_img: np.ndarray) -> np.ndarray:
    """Prewitt gradient magnitude."""
    img_f = gray_img.astype(np.float64)
    kx = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float64)
    ky = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float64)
    gx = convolve(img_f, kx)
    gy = convolve(img_f, ky)
    mag = np.hypot(gx, gy)
    return mag


def compute_sobel_edges(gray_img: np.ndarray) -> np.ndarray:
    """Sobel gradient magnitude (Research default)."""
    img_f = gray_img.astype(np.float64)
    kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float64)
    ky = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float64)
    gx = convolve(img_f, kx)
    gy = convolve(img_f, ky)
    mag = np.hypot(gx, gy)
    return mag


def compute_laplacian_edges(gray_img: np.ndarray) -> np.ndarray:
    """Laplacian second-derivative edge operator."""
    img_f = gray_img.astype(np.float64)
    kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float64)
    lap = np.abs(convolve(img_f, kernel))
    return lap


def threshold_edge_map(
    grad_mag: np.ndarray,
    sigma_factor: float = 2.0
) -> Tuple[np.ndarray, float]:
    """
    Applies automated edge thresholding: T = mu + 2*sigma.
    """
    mu = float(np.mean(grad_mag))
    sigma = float(np.std(grad_mag))
    thresh = mu + sigma_factor * sigma
    binary_edge = np.where(grad_mag >= thresh, 255, 0).astype(np.uint8)
    return binary_edge, thresh


def edge_detection_suite(
    gray_img: np.ndarray
) -> Dict[str, Dict[str, Any]]:
    """
    Computes all four classical edge representations and thresholded masks.
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")

    sobel_mag = compute_sobel_edges(gray_img)
    roberts_mag = compute_roberts_edges(gray_img)
    prewitt_mag = compute_prewitt_edges(gray_img)
    laplacian_mag = compute_laplacian_edges(gray_img)

    results = {}
    operators = [
        ("Sobel", sobel_mag),
        ("Roberts", roberts_mag),
        ("Prewitt", prewitt_mag),
        ("Laplacian", laplacian_mag)
    ]

    for name, mag in operators:
        max_v = mag.max()
        if max_v > 0:
            mag_norm = (mag / max_v * 255.0).astype(np.uint8)
        else:
            mag_norm = np.zeros_like(gray_img, dtype=np.uint8)
        binary_mask, thresh_val = threshold_edge_map(mag)
        results[name.lower()] = {
            "name": name,
            "gradient_map": mag_norm,
            "binary_mask": binary_mask,
            "threshold": thresh_val,
            "mean_gradient": float(np.mean(mag)),
            "std_gradient": float(np.std(mag))
        }

    return results
