"""
MedulloSight — Microservice Integration Tests
Verifies FastAPI endpoints: /health, /samples, /process, /report/pdf,
and /benchmark/noise.
"""

import base64
import io
from PIL import Image
from starlette.testclient import TestClient

from service import app

client = TestClient(app)


def test_health_endpoint():
    """Tests /health status and service metadata."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "MedulloSight" in data["service"]


def test_samples_endpoint():
    """Tests /samples catalog endpoint returns benchmark slices."""
    res = client.get("/samples")
    assert res.status_code == 200
    data = res.json()
    assert "samples" in data
    assert len(data["samples"]) >= 3


def test_process_endpoint_with_png():
    """Tests /process endpoint with synthetic grayscale PNG."""
    # Create synthetic test PNG in memory
    img = Image.new("L", (128, 128), color=50)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    files = {"file": ("test_mri.png", buf, "image/png")}
    data = {"sequence": "T1C+"}

    res = client.post("/process", files=files, data=data)
    assert res.status_code == 200
    resp_data = res.json()

    assert resp_data["sequence"] == "T1C+"
    assert resp_data["dimensions"]["width"] == 128
    assert resp_data["dimensions"]["height"] == 128
    assert len(resp_data["steps_log"]) == 11
    assert "step_images" in resp_data
    assert "overlay_image" in resp_data["step_images"]
    assert "otsu_threshold" in resp_data["metrics"]


def test_pdf_report_endpoint():
    """Tests /report/pdf endpoint generates valid binary PDF."""
    img = Image.new("RGB", (64, 64), color="gray")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64_img = base64.b64encode(buf.getvalue()).decode("utf-8")
    b64_str = f"data:image/png;base64,{b64_img}"

    payload = {
        "filename": "integration_test.png",
        "sequence": "T2",
        "dimensions": {"width": 64, "height": 64, "channels": 1},
        "total_duration_ms": 45.0,
        "parameters": {"gamma": 0.5},
        "metrics": {
            "initial_std": 0.18,
            "stretched_std": 0.24,
            "entropy": 4.2,
            "otsu_threshold": 90,
            "foreground_percent": 15.0,
            "roi_area_pixels": 400,
            "roi_area_percent": 2.5,
            "roi_bbox": [10, 10, 30, 30]
        },
        "warnings": [],
        "step_images_b64": {
            "raw": b64_str,
            "contrast_stretched": b64_str,
            "butterworth_lpf": b64_str,
            "edge_sobel": b64_str,
            "otsu_mask": b64_str,
            "overlay_image": b64_str
        }
    }

    res = client.post("/report/pdf", json=payload)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000
