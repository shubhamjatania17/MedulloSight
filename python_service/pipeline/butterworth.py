"""
Operation 6: 2D FFT Frequency-Domain Butterworth Filtering
Implements 2D Discrete Fourier Transform Butterworth Low-Pass (D0=50, n=2)
and High-Pass (D0=30, n=2) filters with centered magnitude spectrum
visualization.
"""

from typing import Tuple
import numpy as np


def compute_fft_spectrum(
    gray_img: np.ndarray
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Computes the 2D FFT and centered log-magnitude spectrum.

    Args:
        gray_img: 2D uint8 NumPy ndarray.

    Returns:
        Tuple of (F_shift complex array, log_spectrum_uint8).
    """
    f = np.fft.fft2(gray_img.astype(np.float64))
    f_shift = np.fft.fftshift(f)
    magnitude = np.abs(f_shift)

    # Log transform for visual dynamic range: s = c * log(1 + |F|)
    log_spectrum = np.log1p(magnitude)
    min_val, max_val = log_spectrum.min(), log_spectrum.max()
    if max_val > min_val:
        norm = (log_spectrum - min_val) / (max_val - min_val)
        spectrum_uint8 = (norm * 255.0).astype(np.uint8)
    else:
        spectrum_uint8 = np.zeros_like(gray_img, dtype=np.uint8)

    return f_shift, spectrum_uint8


def butterworth_filter(
    gray_img: np.ndarray,
    filter_type: str = "lowpass",
    d0: float = 50.0,
    order: int = 2
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Applies a 2D Butterworth filter in the frequency domain.

    Args:
        gray_img: 2D uint8 NumPy ndarray.
        filter_type: "lowpass" (BLPF) or "highpass" (BHPF).
        d0: Cutoff frequency (default: 50.0 for LPF, 30.0 for HPF).
        order: Filter order n (default: 2).

    Returns:
        Tuple of (filtered_img_uint8, spectrum_uint8, filter_response_uint8).
    """
    if gray_img.ndim != 2:
        raise ValueError("Expected 2D grayscale array")

    rows, cols = gray_img.shape
    crow, ccol = rows // 2, cols // 2

    # Frequency coordinate grid
    u = np.arange(rows)
    v = np.arange(cols)
    v_grid, u_grid = np.meshgrid(v, u)
    d = np.sqrt((u_grid - crow) ** 2 + (v_grid - ccol) ** 2)

    # Avoid division by zero at center for highpass
    d_safe = np.where(d == 0, 1e-6, d)

    if filter_type.lower() == "lowpass":
        # H(u, v) = 1 / (1 + (D(u, v) / D0)^(2n))
        h = 1.0 / (1.0 + np.power(d / max(d0, 1e-6), 2 * order))
    elif filter_type.lower() == "highpass":
        # H(u, v) = 1 / (1 + (D0 / D(u, v))^(2n))
        h = 1.0 / (1.0 + np.power(d0 / d_safe, 2 * order))
        h[crow, ccol] = 0.0
    else:
        raise ValueError(
            f"Unknown filter_type: {filter_type}. "
            "Must be 'lowpass' or 'highpass'"
        )

    # Compute FFT
    f_shift, spectrum_uint8 = compute_fft_spectrum(gray_img)

    # Apply filter in frequency domain
    filtered_shift = f_shift * h

    # Inverse FFT back to spatial domain
    f_ishift = np.fft.ifftshift(filtered_shift)
    img_back = np.fft.ifft2(f_ishift)
    img_real = np.real(img_back)

    # Show high-pass magnitude rather than silently clipping negative responses.
    if filter_type.lower() == "highpass":
        img_real = np.abs(img_real)
        if img_real.max() > 0:
            img_real = img_real / img_real.max() * 255
    # Clip the low-pass response; the high-pass display is magnitude-normalized.
    filtered_uint8 = np.clip(img_real, 0, 255).astype(np.uint8)
    filter_response_uint8 = (h * 255.0).astype(np.uint8)

    return filtered_uint8, spectrum_uint8, filter_response_uint8
