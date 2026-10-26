"""
MRI Image Processing - 6 implementations (Python + OpenCV)

Usage:
    python mri_six_implementations.py path/to/mri_slice.png
If no path is given, a synthetic MRI-like phantom is generated so the code
runs out of the box. Results are saved to ./mri_results/.

Requires: pip install opencv-python numpy matplotlib scikit-image
"""
import os
import sys

import cv2
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from skimage.metrics import peak_signal_noise_ratio as psnr

OUT_DIR = "mri_results"
os.makedirs(OUT_DIR, exist_ok=True)


# --------------------------------------------------------------------------
# Helper: load image (grayscale) or create a synthetic MRI-like phantom
# --------------------------------------------------------------------------
def load_image(path=None):
    if path and os.path.exists(path):
        img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError("Could not read image: " + path)
        return img

    # Synthetic "brain-like" phantom with a bright lesion + noise
    img = np.zeros((256, 256), np.uint8)
    cv2.ellipse(img, (128, 128), (100, 115), 0, 0, 360, 90, -1)    # head
    cv2.ellipse(img, (128, 128), (80, 95), 0, 0, 360, 130, -1)     # brain
    cv2.ellipse(img, (105, 120), (14, 22), 0, 0, 360, 60, -1)      # ventricle
    cv2.ellipse(img, (151, 120), (14, 22), 0, 0, 360, 60, -1)      # ventricle
    cv2.circle(img, (160, 85), 9, 165, -1)                         # lesion
    img = cv2.GaussianBlur(img, (5, 5), 0)
    noise = np.random.default_rng(0).normal(0, 12, img.shape)
    return np.clip(img + noise, 0, 255).astype(np.uint8)


# --------------------------------------------------------------------------
# 1. Contrast enhancement: Histogram Equalization + CLAHE
# --------------------------------------------------------------------------
def contrast_enhancement(img):
    he = cv2.equalizeHist(img)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    return he, clahe.apply(img)


# --------------------------------------------------------------------------
# 2. Noise removal: Gaussian, Median, Non-Local Means
# --------------------------------------------------------------------------
def denoise(img):
    gauss = cv2.GaussianBlur(img, (5, 5), 1.2)
    median = cv2.medianBlur(img, 5)
    nlm = cv2.fastNlMeansDenoising(img, None, h=15,
                                   templateWindowSize=7, searchWindowSize=21)
    return gauss, median, nlm


# --------------------------------------------------------------------------
# 3. Sharpening / edge enhancement: Unsharp masking + Laplacian
# --------------------------------------------------------------------------
def sharpen(img):
    blur = cv2.GaussianBlur(img, (0, 0), 2.0)
    unsharp = cv2.addWeighted(img, 1.8, blur, -0.8, 0)

    lap = cv2.Laplacian(img, cv2.CV_64F, ksize=3)
    lap_sharp = np.clip(img.astype(np.float64) - lap, 0, 255).astype(np.uint8)
    return unsharp, lap_sharp


# --------------------------------------------------------------------------
# 4. Segmentation: Otsu thresholding + adaptive threshold
# --------------------------------------------------------------------------
def segment(img):
    smooth = cv2.GaussianBlur(img, (5, 5), 0)
    _, otsu = cv2.threshold(smooth, 0, 255,
                            cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    adaptive = cv2.adaptiveThreshold(smooth, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY, 31, -5)
    return otsu, adaptive


# --------------------------------------------------------------------------
# 5. Morphology: Erosion, Dilation, Opening, Closing, Gradient
# --------------------------------------------------------------------------
def morphology(binary):
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    erosion = cv2.erode(binary, kernel, iterations=1)
    dilation = cv2.dilate(binary, kernel, iterations=1)
    opening = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)    # removes specks
    closing = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)   # fills holes
    gradient = cv2.morphologyEx(binary, cv2.MORPH_GRADIENT, kernel)  # boundary
    return erosion, dilation, opening, closing, gradient


# --------------------------------------------------------------------------
# 6. Skull stripping / ROI extraction: threshold -> opening -> largest
#    connected component -> hole filling -> masked image
# --------------------------------------------------------------------------
def extract_brain(img):
    _, mask = cv2.threshold(cv2.GaussianBlur(img, (5, 5), 0), 0, 255,
                            cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)

    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
    if n > 1:
        largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        mask = np.where(labels == largest, 255, 0).astype(np.uint8)

    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    # Fill internal holes via flood fill from the corner
    flood = mask.copy()
    h, w = mask.shape
    ff_mask = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(flood, ff_mask, (0, 0), 255)
    mask = mask | cv2.bitwise_not(flood)

    return mask, cv2.bitwise_and(img, img, mask=mask)


# --------------------------------------------------------------------------
# Plot helper
# --------------------------------------------------------------------------
def show(images, titles, fname, cols=3):
    rows = int(np.ceil(len(images) / cols))
    plt.figure(figsize=(4 * cols, 4 * rows))
    for i, (im, t) in enumerate(zip(images, titles), 1):
        plt.subplot(rows, cols, i)
        plt.imshow(im, cmap="gray", vmin=0, vmax=255)
        plt.title(t, fontsize=10)
        plt.axis("off")
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, fname), dpi=120)
    plt.close()


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
if __name__ == "__main__":
    img = load_image(sys.argv[1] if len(sys.argv) > 1 else None)

    # 1. Contrast
    he, clahe = contrast_enhancement(img)
    show([img, he, clahe], ["Original", "Histogram Equalization", "CLAHE"],
         "1_contrast.png")

    # 2. Denoising
    gauss, median, nlm = denoise(img)
    show([img, gauss, median, nlm],
         ["Noisy original", "Gaussian", "Median", "Non-Local Means"],
         "2_denoise.png", cols=4)

    # 3. Sharpening
    unsharp, lap = sharpen(nlm)
    show([nlm, unsharp, lap], ["Denoised", "Unsharp mask", "Laplacian sharpen"],
         "3_sharpen.png")

    # 4. Segmentation
    otsu, adaptive = segment(nlm)
    show([nlm, otsu, adaptive], ["Denoised", "Otsu threshold", "Adaptive threshold"],
         "4_segmentation.png")

    # 5. Morphology
    ero, dil, opn, cls, grad = morphology(otsu)
    show([otsu, ero, dil, opn, cls, grad],
         ["Binary (Otsu)", "Erosion", "Dilation", "Opening", "Closing",
          "Morphological gradient"], "5_morphology.png")

    # 6. Brain extraction
    mask, brain = extract_brain(nlm)
    show([nlm, mask, brain], ["Input", "Brain mask", "Extracted region"],
         "6_brain_extraction.png")

    print("Done. Figures saved in ./%s/" % OUT_DIR)
