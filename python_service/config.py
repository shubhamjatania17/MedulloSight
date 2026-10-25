"""
MedulloSight — Core Pipeline Configuration & Research Constants
Centralized hyperparameter definitions strictly following the research
methodology.
"""

# Contrast Stretching Percentiles (Research default: 1st - 99th percentile)
CONTRAST_LOW_PERCENTILE = 1.0
CONTRAST_HIGH_PERCENTILE = 99.0

# Power-Law / Gamma Transformation Parameters
GAMMA_DEFAULT = 0.5
GAMMA_C = 1.0
GAMMA_OPTIONS = [0.5, 1.0, 1.5]

# Histogram Equalization Levels
HISTOGRAM_LEVELS = 256

# Denoising Filter Parameters
MEDIAN_KERNEL_SIZE = 3
SYNTHETIC_NOISE_DENSITY = 0.05

# Frequency Domain 2D FFT Butterworth Parameters
BUTTERWORTH_LPF_D0 = 50.0  # Cutoff frequency for Low-Pass Filter
BUTTERWORTH_HPF_D0 = 30.0  # Cutoff frequency for High-Pass Filter
BUTTERWORTH_ORDER = 2      # Filter order n=2

# Edge Detection Constants
EDGE_THRESHOLD_SIGMA_FACTOR = 2.0  # mu + 2*sigma thresholding

# Morphological Structuring Element Radii (Flat Disk)
MORPHOLOGY_DISK_RADIUS_SMALL = 3  # For erosion and dilation
MORPHOLOGY_DISK_RADIUS_LARGE = 7  # For opening and closing
# 8-connectivity for connected component labeling
CONNECTIVITY = 8

# Otsu Baseline Reference Range documented in research report
OTSU_OBSERVED_MIN = 51
OTSU_OBSERVED_MAX = 109

# Failure Detection Heuristic Thresholds
MIN_FOREGROUND_PERCENT = 0.5   # Under-segmentation / empty mask flag
MAX_FOREGROUND_PERCENT = 60.0  # Over-segmentation flag
# Peripheral border contact (scalp fat / crop artifact)
MAX_BORDER_CONTACT_PERCENT = 10.0
MAX_FRAGMENTED_COMPONENTS = 40     # Excessive component fragmentation

# Team members schema (configurable placeholders per Master Prompt)
TEAM_MEMBERS = [
    {
        "name": "[NAME]",
        "roll_no": "[ROLL NO.]",
        "photo": "/assets/team/member1.jpg"
    },
    {
        "name": "[NAME]",
        "roll_no": "[ROLL NO.]",
        "photo": "/assets/team/member2.jpg"
    },
    {
        "name": "[NAME]",
        "roll_no": "[ROLL NO.]",
        "photo": "/assets/team/member3.jpg"
    }
]
