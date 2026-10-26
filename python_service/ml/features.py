"""Shared preprocessing for training and inference. No dataset-wide fitting."""
import numpy as np
from PIL import Image, ImageOps
from scipy.fft import dctn
from scipy.ndimage import median_filter, sobel
from skimage.feature import hog, local_binary_pattern

PREPROCESSING_VERSION = "sip-ml-v1"
IMAGE_SIZE = 192


def prepare_image(raw, variant="raw"):
    image = Image.fromarray(raw).convert("L")
    # Aspect ratio is retained; the padding policy is identical at inference.
    gray = np.asarray(ImageOps.pad(image, (IMAGE_SIZE, IMAGE_SIZE), method=Image.Resampling.LANCZOS), dtype=np.uint8)
    if variant == "sip":
        low, high = np.percentile(gray, [1, 99])
        if high > low:
            gray = np.uint8(np.clip((gray.astype(float) - low) / (high - low), 0, 1) * 255)
        gray = np.uint8(np.sqrt(gray.astype(float) / 255) * 255)
        gray = median_filter(gray, size=3)
    return gray


def extract_features(gray):
    values = gray.astype(np.float32) / 255
    histogram = np.histogram(values, bins=32, range=(0, 1), density=False)[0] / values.size
    texture = local_binary_pattern(gray, 8, 1, method="uniform")
    texture_hist = np.histogram(texture, bins=10, range=(0, 10))[0] / values.size
    gradient = np.hypot(sobel(values, axis=0), sobel(values, axis=1))
    stats = [values.mean(), values.std(), np.median(values), *np.percentile(values, [10, 25, 75, 90]),
             gradient.mean(), gradient.std(), float(np.mean(values > .1))]
    dct = dctn(np.asarray(Image.fromarray(gray).resize((32, 32)), dtype=float) / 255, norm="ortho")[:8, :8].ravel()
    edges = hog(values, orientations=8, pixels_per_cell=(32, 32), cells_per_block=(1, 1), feature_vector=True)
    return np.concatenate([histogram, texture_hist, stats, dct, edges]).astype(np.float32)
