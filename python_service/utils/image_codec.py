"""
MedulloSight — Image Codec Utilities
Handles robust conversions between NumPy arrays, byte buffers, and
Base64 PNGs.
"""

import io
import base64
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError


def array_to_base64_png(array: np.ndarray) -> str:
    """
    Converts a uint8 NumPy array (2D grayscale or 3D RGB) to a
    Base64-encoded PNG string.
    """
    if array.dtype != np.uint8:
        # Normalize float arrays to uint8 [0, 255]
        if np.issubdtype(array.dtype, np.floating):
            if array.max() <= 1.0:
                norm = np.clip(array, 0.0, 1.0)
            else:
                norm = np.clip(array / 255.0, 0.0, 1.0)
            array = (norm * 255.0).astype(np.uint8)
        else:
            array = np.clip(array, 0, 255).astype(np.uint8)

    if array.ndim == 2:
        img = Image.fromarray(array, mode="L")
    elif array.ndim == 3:
        if array.shape[2] == 3:
            img = Image.fromarray(array, mode="RGB")
        elif array.shape[2] == 4:
            img = Image.fromarray(array, mode="RGBA")
        else:
            msg = f"Unsupported channel dimension: {array.shape[2]}"
            raise ValueError(msg)
    else:
        raise ValueError(f"Unsupported array dimensions: {array.ndim}")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"

def bytes_to_numpy(image_bytes: bytes) -> np.ndarray:
    """
    Decodes raw image bytes (JPEG, PNG, TIFF, BMP) into a NumPy array.
    """
    if len(image_bytes) > 30 * 1024 * 1024:
        raise ValueError("Maximum upload size is 30 MB")
    try:
        with Image.open(io.BytesIO(image_bytes)) as pil_img:
            if pil_img.width * pil_img.height > 4_194_304:
                raise ValueError("Maximum image size is 4 megapixels")
            pil_img.load()
            pil_img = ImageOps.exif_transpose(pil_img)
            if pil_img.mode not in ("L", "RGB", "I", "F", "I;16", "I;16B"):
                pil_img = pil_img.convert("RGB")
            arr = np.array(pil_img)
    except UnidentifiedImageError:
        import pydicom
        from pydicom.pixels import apply_modality_lut, apply_voi_lut
        try:
            dataset = pydicom.dcmread(io.BytesIO(image_bytes))
            if int(getattr(dataset, "NumberOfFrames", 1)) != 1:
                raise ValueError("Upload a single-frame 2D DICOM slice")
            if int(dataset.Rows) * int(dataset.Columns) > 4_194_304:
                raise ValueError("Maximum image size is 4 megapixels")
            arr = apply_voi_lut(apply_modality_lut(dataset.pixel_array, dataset), dataset).astype(float)
            if arr.ndim != 2:
                raise ValueError("Only single-channel 2D DICOM slices are supported")
            if dataset.PhotometricInterpretation == "MONOCHROME1":
                arr = arr.max() + arr.min() - arr
        except Exception as exc:
            raise ValueError(f"Unsupported image or DICOM: {exc}") from exc
    if arr.dtype != np.uint8:
        arr = arr.astype(float)
        low, high = float(arr.min()), float(arr.max())
        arr = np.uint8(np.clip((arr-low) / (high-low), 0, 1)*255) if high > low else np.zeros(arr.shape, dtype=np.uint8)
    if min(arr.shape[:2]) < 16:
        raise ValueError("Minimum image dimensions are 16 by 16")
    return arr
