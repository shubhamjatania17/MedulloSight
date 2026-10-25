"""
MedulloSight — Anomaly Detection & T1 Failure Guard System
Detects conditions where global Otsu thresholding exhibits known failure
modes, especially on T1-weighted sequences where high-intensity scalp fat
can dominate.
"""

from typing import Dict, List
import numpy as np


def detect_pipeline_anomalies(
    sequence: str,
    otsu_threshold: int,
    foreground_percent: float,
    candidate_mask: np.ndarray,
    roi_area_percent: float,
    cc_count_opened: int
) -> List[Dict[str, str]]:
    """
    Evaluates pipeline intermediate masks against clinical/research
    failure modes.

    Returns:
        List of warning dicts: [{"code": "...", "message": "...",
        "severity": "warning"|"advisory"}]
    """
    warnings = []
    h, w = candidate_mask.shape

    # 1. Nearly empty or extremely small foreground
    if foreground_percent < 0.5 or roi_area_percent < 0.1:
        warnings.append({
            "code": "UNDER_SEGMENTATION",
            "severity": "warning",
            "message": (
                "Candidate mask covers less than 0.5% of slice. "
                "Intensity distribution may lack distinct foreground modes."
            )
        })

    # 2. Extremely large foreground region (over-segmentation)
    if foreground_percent > 60.0 or roi_area_percent > 45.0:
        warnings.append({
            "code": "OVER_SEGMENTATION",
            "severity": "warning",
            "message": (
                "Candidate foreground covers over 60% of image area, "
                "likely encompassing intracranial cavity, skull, "
                "or background."
            )
        })

    # 3. Excessive morphological fragmentation post-opening
    if cc_count_opened > 40:
        warnings.append({
            "code": "HIGH_FRAGMENTATION",
            "severity": "warning",
            "message": (
                f"High component fragmentation detected "
                f"({cc_count_opened} components). Image may exhibit "
                f"diffuse contrast or sequence noise."
            )
        })

    # 4. Peripheral boundary contact heuristic
    # Checks for scalp fat, coil artifacts, or acquisition boundaries
    border_pixels = 0
    border_pixels += np.count_nonzero(candidate_mask[0, :])
    border_pixels += np.count_nonzero(candidate_mask[-1, :])
    border_pixels += np.count_nonzero(candidate_mask[:, 0])
    border_pixels += np.count_nonzero(candidate_mask[:, -1])
    total_perimeter = 2 * (h + w)
    border_contact_ratio = (border_pixels / total_perimeter) * 100.0

    if border_contact_ratio > 10.0:
        warnings.append({
            "code": "PERIPHERAL_BORDER_CONTACT",
            "severity": "warning",
            "message": (
                f"Candidate region touches {border_contact_ratio:.1f}% "
                f"of image perimeter, indicating potential scalp fat, "
                f"calvarial bone, or edge cropping artifact."
            )
        })

    # 5. Specific T1 Non-Contrast Scalp Fat Failure Mode
    # On T1, subcutaneous fat is bright (hyperintense) while medulloblastoma
    # is often hypointense. Global Otsu may isolate peripheral scalp fat.
    if sequence.upper() == "T1":
        # Check if candidate region is near the perimeter
        y_indices, x_indices = np.where(candidate_mask > 0)
        if len(y_indices) > 0:
            cy = np.mean(y_indices) / h
            cx = np.mean(x_indices) / w
            dist_from_center = np.sqrt((cy - 0.5) ** 2 + (cx - 0.5) ** 2)
            if dist_from_center > 0.35 or border_contact_ratio > 5.0:
                warnings.append({
                    "code": "T1_FAT_SUPPRESSION_LIMITATION",
                    "severity": "warning",
                    "message": (
                        "Known T1 Sequence Limitation: High-intensity "
                        "subcutaneous scalp fat frequently dominates global "
                        "Otsu thresholding in non-contrast T1 acquisitions. "
                        "The extracted candidate region may represent "
                        "non-tumoral scalp tissue rather than posterior-fossa "
                        "structures."
                    )
                })

    # 6. Otsu threshold out of documented baseline empirical range (51 - 109)
    if otsu_threshold < 40 or otsu_threshold > 130:
        warnings.append({
            "code": "UNUSUAL_OTSU_THRESHOLD",
            "severity": "advisory",
            "message": (
                f"Computed Otsu threshold ({otsu_threshold}) lies outside "
                f"typical empirical range (51-109 gray levels). Slice may "
                f"exhibit non-standard window leveling or brightness scaling."
            )
        })

    return warnings
