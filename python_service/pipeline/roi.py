"""
Operation 11: Candidate ROI Extraction & Anatomical Overlay
Filters 8-connected components to identify largest candidate region,
computes bounding box and metrics, and renders a scientific contour.
Strictly designated as: "Candidate ROI / Segmentation Candidate".
"""

from typing import Dict, Any
import numpy as np
from scipy.ndimage import (
    label,
    center_of_mass,
    binary_dilation,
    binary_erosion
)


def extract_candidate_roi(
    morph_mask: np.ndarray,
    raw_img: np.ndarray,
    connectivity: int = 8
) -> Dict[str, Any]:
    """
    Extracts the primary candidate region from the morphological mask
    and constructs a scientific anatomical overlay on the raw MRI.

    Args:
        morph_mask: 2D uint8 binary mask from morphological operation.
        raw_img: Original image (2D grayscale or 3D RGB).
        connectivity: 8-connectivity.

    Returns:
        Dict with bounding box, area, area percent, centroid,
        candidate mask, and composite overlay.
    """
    h, w = morph_mask.shape
    total_pixels = h * w
    struct = np.ones((3, 3), dtype=bool) if connectivity == 8 else None

    labeled, num_features = label(morph_mask > 0, structure=struct)

    if num_features == 0:
        # No components found; return empty candidate
        if raw_img.ndim == 3:
            overlay = raw_img[:, :, :3].copy()
        else:
            overlay = np.stack([raw_img] * 3, axis=-1)
        return {
            "has_candidate": False,
            "candidate_mask": np.zeros_like(morph_mask, dtype=np.uint8),
            "overlay_image": overlay,
            "roi_area_pixels": 0,
            "roi_area_percent": 0.0,
            "roi_bbox": [0, 0, 0, 0],  # [ymin, xmin, ymax, xmax]
            "centroid": [0.0, 0.0],
            "total_components": 0,
            "label": "Candidate ROI (None Detected)"
        }

    # Find component with largest area
    component_sizes = np.bincount(labeled.ravel())
    # Exclude background (label 0)
    component_sizes[0] = 0
    largest_label = int(np.argmax(component_sizes))
    roi_area_pixels = int(component_sizes[largest_label])
    roi_area_percent = float((roi_area_pixels / total_pixels) * 100.0)

    # Isolate candidate component mask
    candidate_mask = np.where(
        labeled == largest_label, 255, 0
    ).astype(np.uint8)

    # Bounding box using coordinate extents
    y_indices, x_indices = np.where(candidate_mask > 0)
    if len(y_indices) > 0:
        ymin = int(np.min(y_indices))
        ymax = int(np.max(y_indices) + 1)
        xmin = int(np.min(x_indices))
        xmax = int(np.max(x_indices) + 1)
        bbox = [ymin, xmin, ymax, xmax]
    else:
        bbox = [0, 0, 0, 0]

    # Centroid
    cy, cx = center_of_mass(candidate_mask > 0)
    centroid = [float(cy), float(cx)]

    # Generate composite overlay
    # Ensure base is 3-channel RGB for distinct scientific overlay
    if raw_img.ndim == 2:
        base_rgb = np.stack([raw_img] * 3, axis=-1)
    else:
        base_rgb = raw_img[:, :, :3].copy()

    overlay = base_rgb.copy()

    # 1. Subtle semi-transparent cyan fill (alpha = 0.25)
    # Color: Teal / Cyan (RGB: [20, 160, 200])
    cyan_fill = np.zeros_like(base_rgb)
    cyan_fill[candidate_mask > 0] = [20, 160, 200]
    mask_indices = candidate_mask > 0
    overlay[mask_indices] = (
        0.75 * base_rgb[mask_indices] + 0.25 * cyan_fill[mask_indices]
    ).astype(np.uint8)

    # 2. Distinct boundary contour (RGB: [13, 148, 136] / Teal 700)
    boundary = binary_dilation(candidate_mask > 0) ^ binary_erosion(
        candidate_mask > 0
    )
    overlay[boundary] = [13, 148, 136]

    # 3. Clean rectangular bounding box (RGB: [37, 99, 235])
    ymin, xmin, ymax, xmax = bbox
    if ymax > ymin and xmax > xmin:
        overlay[ymin:ymax, xmin] = [37, 99, 235]
        overlay[ymin:ymax, xmax - 1] = [37, 99, 235]
        overlay[ymin, xmin:xmax] = [37, 99, 235]
        overlay[ymax - 1, xmin:xmax] = [37, 99, 235]

    return {
        "has_candidate": True,
        "candidate_mask": candidate_mask,
        "overlay_image": overlay,
        "roi_area_pixels": roi_area_pixels,
        "roi_area_percent": roi_area_percent,
        "roi_bbox": bbox,
        "centroid": centroid,
        "total_components": num_features,
        "label": "Candidate ROI / Segmentation Candidate"
    }
