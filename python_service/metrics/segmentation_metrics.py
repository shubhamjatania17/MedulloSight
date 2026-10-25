"""
MedulloSight — Segmentation & Geometric Metrics
Quantifies binary masks and candidate regions.
Note: Dice/IoU metrics are NOT computed without expert ground truth.
"""

from typing import Dict, Any


def compute_segmentation_metrics(
    otsu_res: Dict[str, Any],
    morph_res: Dict[str, Any],
    roi_res: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Consolidates non-diagnostic morphological and segmentation telemetry.
    """
    open_close = morph_res.get("opening_closing", {})

    return {
        "otsu_threshold": otsu_res.get("threshold", 0),
        "foreground_percent": otsu_res.get("foreground_percent", 0.0),
        "cc_count_initial": otsu_res.get("foreground_pixels", 0),
        "cc_count_before_open": open_close.get("cc_before", 0),
        "cc_count_after_open": open_close.get("cc_opened", 0),
        "cc_reduction_percent": open_close.get("cc_reduction_percent", 0.0),
        "has_candidate": roi_res.get("has_candidate", False),
        "roi_area_pixels": roi_res.get("roi_area_pixels", 0),
        "roi_area_percent": roi_res.get("roi_area_percent", 0.0),
        "roi_bbox": roi_res.get("roi_bbox", [0, 0, 0, 0]),
        "centroid": roi_res.get("centroid", [0.0, 0.0]),
        "validation_notice": (
            "Geometric/classical measurements only. "
            "No clinical Dice/IoU ground-truth assumed."
        )
    }
