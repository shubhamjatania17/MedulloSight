"""
MedulloSight — Image Codec Utilities
Handles robust conversions between NumPy arrays, byte buffers, and
Base64 PNGs.
"""

import io
import base64
import numpy as np
from PIL import Image


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
    buffer = io.BytesIO(image_bytes)
    with Image.open(buffer) as pil_img:
        pil_img.load()
        # Convert paletted or 1-bit images to RGB or L
        if pil_img.mode in ("P", "1"):
            pil_img = pil_img.convert("RGB")
        arr = np.array(pil_img)
    return arr
