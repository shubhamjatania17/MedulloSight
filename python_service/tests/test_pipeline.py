"""
MedulloSight — Comprehensive Unit Test Suite
Validates the 10 classical image-processing operations, edge cases,
and failure guards.
"""

# pylint: disable=redefined-outer-name

import numpy as np
import pytest

from pipeline import (
    to_grayscale,
    contrast_stretching,
    gamma_transformation,
    histogram_equalization,
    apply_median_filter,
    inject_synthetic_noise,
    butterworth_filter,
    edge_detection_suite,
    otsu_thresholding,
    apply_erosion_dilation,
    apply_opening_closing,
    extract_candidate_roi,
    run_classical_pipeline
)
from metrics import (
    compute_mse_psnr,
    detect_pipeline_anomalies
)


@pytest.fixture
def sample_rgb_slice():
    """Generates a synthetic 128x128 test MRI slice."""
    h, w = 128, 128
    y, x = np.ogrid[:h, :w]
    circle = ((y - 64) ** 2 + (x - 64) ** 2 <= 40 ** 2).astype(np.uint8) * 120
    # Add candidate central lesion
    lesion = ((y - 75) ** 2 + (x - 64) ** 2 <= 12 ** 2).astype(np.uint8) * 90
    combined = circle + lesion
    rgb = np.stack([combined, combined, combined], axis=-1)
    return rgb


def test_grayscale_conversion(sample_rgb_slice):
    """Tests 3-channel RGB to 2D uint8 grayscale conversion."""
    gray = to_grayscale(sample_rgb_slice)
    assert gray.ndim == 2
    assert gray.dtype == np.uint8
    assert gray.shape == (128, 128)
    # Check already grayscale pass-through
    gray2 = to_grayscale(gray)
    assert np.array_equal(gray, gray2)


def test_contrast_stretching():
    """Tests 1st-99th percentile dynamic range stretching."""
    img = np.random.randint(50, 150, (64, 64), dtype=np.uint8)
    stretched, p_low, p_high = contrast_stretching(img, 1.0, 99.0)
    assert stretched.shape == img.shape
    assert stretched.dtype == np.uint8
    assert p_low <= p_high
    assert np.std(stretched) >= np.std(img)


def test_gamma_transformation():
    """Tests power-law transformation for gamma < 1 and gamma > 1."""
    img = np.full((32, 32), 100, dtype=np.uint8)
    brightened = gamma_transformation(img, gamma=0.5)
    darkened = gamma_transformation(img, gamma=1.5)
    # Gamma < 1 brightens, Gamma > 1 darkens
    assert np.mean(brightened) > np.mean(img)
    assert np.mean(darkened) < np.mean(img)


def test_histogram_equalization():
    """Tests global CDF equalization and 256-bin histogram calculation."""
    img = np.random.randint(60, 120, (64, 64), dtype=np.uint8)
    eq, h_orig, h_eq = histogram_equalization(img)
    assert eq.shape == img.shape
    assert len(h_orig) == 256
    assert len(h_eq) == 256
    assert np.std(eq) > np.std(img)


def test_median_filter_and_synthetic_noise():
    """Tests synthetic impulse noise injection and median filter denoising."""
    clean = np.full((64, 64), 128, dtype=np.uint8)
    noisy = inject_synthetic_noise(clean, density=0.05, seed=42)
    filtered = apply_median_filter(noisy, kernel_size=3)

    noisy_metrics = compute_mse_psnr(clean, noisy)
    filtered_metrics = compute_mse_psnr(clean, filtered)

    assert filtered_metrics["exact_match"] or filtered_metrics["psnr"] > noisy_metrics["psnr"]
    assert filtered_metrics["mse"] < noisy_metrics["mse"]


def test_butterworth_filters():
    """Tests 2D FFT Butterworth low-pass and high-pass filtering."""
    img = np.random.randint(0, 255, (64, 64), dtype=np.uint8)
    lpf, spectrum, _ = butterworth_filter(
        img, filter_type="lowpass", d0=20, order=2
    )
    hpf, _, _ = butterworth_filter(
        img, filter_type="highpass", d0=15, order=2
    )

    assert lpf.shape == img.shape
    assert hpf.shape == img.shape
    assert spectrum.shape == img.shape
    assert lpf.dtype == np.uint8
    assert hpf.dtype == np.uint8


def test_edge_detection_suite():
    """Tests Sobel, Roberts, Prewitt, and Laplacian edge detectors."""
    img = np.zeros((64, 64), dtype=np.uint8)
    img[:, 32:] = 200  # Vertical step edge
    results = edge_detection_suite(img)

    for op in ["sobel", "roberts", "prewitt", "laplacian"]:
        assert op in results
        assert results[op]["gradient_map"].shape == img.shape
        assert results[op]["binary_mask"].shape == img.shape
        # Edge should be detected along column 31 or 32
        assert np.max(results[op]["binary_mask"][:, 31:33]) == 255


def test_otsu_thresholding():
    """Tests bimodal Otsu variance maximization and threshold determination."""
    # Bimodal distribution (0 and 200)
    img = np.zeros((64, 64), dtype=np.uint8)
    img[:32, :] = 200
    res = otsu_thresholding(img)

    assert 50 < res["threshold"] < 150
    assert 45.0 <= res["foreground_percent"] <= 55.0
    assert res["binary_mask"].shape == img.shape


def test_morphology_pipeline():
    """Tests morphological erosion, dilation, opening, and closing."""
    # Create mask with small isolated noise points and a main component
    mask = np.zeros((64, 64), dtype=np.uint8)
    mask[20:44, 20:44] = 255  # Main component
    mask[5, 5] = 255          # Isolated noise dot
    mask[10, 10] = 255        # Isolated noise dot

    res_ed = apply_erosion_dilation(mask, radius=3)
    res_oc = apply_opening_closing(mask, radius=3, connectivity=8)

    assert res_ed["eroded_mask"] is not None
    # Opening should remove the isolated noise dots
    assert res_oc["cc_opened"] < res_oc["cc_before"]
    assert res_oc["cc_reduction_percent"] > 0


def test_candidate_roi_extraction():
    """Tests primary candidate component isolation and bounding box."""
    mask = np.zeros((64, 64), dtype=np.uint8)
    mask[20:40, 20:40] = 255  # 20x20 square = 400 pixels
    mask[50:52, 50:52] = 255  # 2x2 square = 4 pixels
    raw = np.full((64, 64), 100, dtype=np.uint8)

    roi_res = extract_candidate_roi(mask, raw, connectivity=8)
    assert roi_res["has_candidate"] is True
    assert roi_res["roi_area_pixels"] == 400
    assert roi_res["roi_bbox"] == [20, 20, 40, 40]
    assert roi_res["overlay_image"].shape == (64, 64, 3)


def test_edge_cases():
    """Tests solid black, solid white, and miniature dimensions."""
    # 1. Solid black image
    black = np.zeros((32, 32), dtype=np.uint8)
    res_b = run_classical_pipeline(black, sequence="Unknown")
    assert res_b["roi_results"]["has_candidate"] is False

    # 2. Solid white image
    white = np.full((32, 32), 255, dtype=np.uint8)
    res_w = run_classical_pipeline(white, sequence="Unknown")
    assert res_w["total_duration_ms"] > 0

    # 3. Small image (16x16)
    small = np.random.randint(0, 255, (16, 16), dtype=np.uint8)
    res_s = run_classical_pipeline(small, sequence="Unknown")
    assert res_s["step_arrays"]["grayscale"].shape == (16, 16)


def test_t1_anomaly_detection():
    """Tests perimeter contact anomaly triggering on non-contrast T1."""
    # Create mask touching perimeter simulating scalp fat
    h, w = 100, 100
    mask = np.zeros((h, w), dtype=np.uint8)
    mask[0, :] = 255   # Full top border contact
    mask[-1, :] = 255  # Full bottom border contact

    warnings = detect_pipeline_anomalies(
        sequence="T1",
        otsu_threshold=80,
        foreground_percent=15.0,
        candidate_mask=mask,
        roi_area_percent=15.0,
        cc_count_opened=5
    )

    warn_codes = [w["code"] for w in warnings]
    assert (
        "PERIPHERAL_BORDER_CONTACT" in warn_codes
        or "T1_FAT_SUPPRESSION_LIMITATION" in warn_codes
    )
