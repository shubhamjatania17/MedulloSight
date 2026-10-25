"""
Operations 9 & 10: Morphological Processing
Implements binary erosion, dilation (disk radius 3), opening,
and closing (disk radius 7) with 8-connected component tracking
and component reduction telemetry.
"""

from typing import Tuple, Dict, Any
import numpy as np
from scipy.ndimage import (
    binary_erosion,
    binary_dilation,
    binary_opening,
    binary_closing,
    label
)
from skimage.morphology import disk


def get_connected_components_count(
    binary_mask: np.ndarray,
    connectivity: int = 8
) -> Tuple[int, np.ndarray]:
    """
    Counts connected components and returns labeled image array.
    Using 8-connectivity (structure = 3x3 of 1s).
    """
    if connectivity == 8:
        struct = np.ones((3, 3), dtype=bool)
    else:
        struct = np.array(
            [[0, 1, 0], [1, 1, 1], [0, 1, 0]], dtype=bool
        )
    labeled, num_features = label(binary_mask > 0, structure=struct)
    return int(num_features), labeled


def apply_erosion_dilation(
    binary_mask: np.ndarray,
    radius: int = 3
) -> Dict[str, Any]:
    """
    Operation 9: Morphological Erosion and Dilation with disk radius 3.
    """
    if binary_mask.ndim != 2:
        raise ValueError("Expected 2D binary mask")

    selem = disk(radius)
    eroded = binary_erosion(binary_mask > 0, structure=selem)
    dilated = binary_dilation(binary_mask > 0, structure=selem)

    cc_before, _ = get_connected_components_count(binary_mask)
    cc_eroded, _ = get_connected_components_count(eroded)
    cc_dilated, _ = get_connected_components_count(dilated)

    return {
        "eroded_mask": (eroded * 255).astype(np.uint8),
        "dilated_mask": (dilated * 255).astype(np.uint8),
        "cc_before": cc_before,
        "cc_eroded": cc_eroded,
        "cc_dilated": cc_dilated,
        "disk_radius": radius
    }


def apply_opening_closing(
    binary_mask: np.ndarray,
    radius: int = 7,
    connectivity: int = 8
) -> Dict[str, Any]:
    """
    Operation 10: Morphological Opening and Closing with disk radius 7
    and 8-connectivity.
    """
    if binary_mask.ndim != 2:
        raise ValueError("Expected 2D binary mask")

    selem = disk(radius)
    opened = binary_opening(binary_mask > 0, structure=selem)
    closed = binary_closing(binary_mask > 0, structure=selem)

    cc_before, _ = get_connected_components_count(
        binary_mask, connectivity=connectivity
    )
    cc_opened, labeled_opened = get_connected_components_count(
        opened, connectivity=connectivity
    )
    cc_closed, _ = get_connected_components_count(
        closed, connectivity=connectivity
    )

    denom = max(cc_before, 1)
    reduction_percent = float(((cc_before - cc_opened) / denom) * 100.0)

    return {
        "opened_mask": (opened * 255).astype(np.uint8),
        "closed_mask": (closed * 255).astype(np.uint8),
        "labeled_opened": labeled_opened,
        "cc_before": cc_before,
        "cc_opened": cc_opened,
        "cc_closed": cc_closed,
        "cc_reduction_percent": reduction_percent,
        "disk_radius": radius,
        "connectivity": connectivity
    }
