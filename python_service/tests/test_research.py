import io
import json
from pathlib import Path
import subprocess
import sys

import numpy as np
import pytest
from PIL import Image
from starlette.testclient import TestClient

from service import app
from storage import get_case, save_case
from ml.features import prepare_image, extract_features
from ml.inference import ARTIFACTS, predict
from utils.image_codec import bytes_to_numpy

ROOT = Path(__file__).resolve().parents[2]
client = TestClient(app)


def sample_file():
    return (ROOT / "client/public/mri/MB04_T1C.jpg").read_bytes()


def test_frozen_splits_prevent_group_and_pixel_leakage():
    records = json.loads((ARTIFACTS / "splits.json").read_text())
    groups, pixels = {}, {}
    for record in records:
        if record["split"] not in {"train", "validation", "test"}:
            continue
        for seen, key in [(groups, record["group"]), (pixels, record["pixel_sha256"])]:
            assert key not in seen or seen[key] == record["split"]
            seen[key] = record["split"]
    audit = json.loads((ROOT / "research/dataset_audit/summary.json").read_text())
    by_path = {r["path"]:r for r in records}
    for item in audit["notebook_matches"]:
        for path in item["archive_matches"]:
            assert by_path[path]["split"] == "demonstration"


def test_model_selection_uses_validation_and_metrics_match_counts():
    evaluation = json.loads((ARTIFACTS / "evaluation.json").read_text())
    assert evaluation["default_model"] == max(evaluation["models"], key=lambda m:m["validation"]["f1"])["id"]
    for model in evaluation["models"]:
        cm = model["test"]["confusion_matrix"]
        assert sum(map(sum, cm)) == model["test"]["n"]
        assert sum(cm[1]) == model["test"]["positive_n"]
        assert model["test"]["recall"] == pytest.approx(cm[1][1]/sum(cm[1]))


def test_inference_matches_repeated_preprocessing_and_keeps_demo_provenance():
    raw = bytes_to_numpy(sample_file())
    prepared = prepare_image(raw, "sip")
    assert np.array_equal(prepared, prepare_image(raw, "sip"))
    assert np.all(np.isfinite(extract_features(prepared)))
    result = predict(raw)
    assert result["known_dataset_split"] == "demonstration"
    assert len(result["predictions"]) == 4
    assert all(0 <= p["score"] <= 1 for p in result["predictions"])


def test_full_case_roundtrip_notes_and_experiment_nonpersistence():
    response = client.post("/process", files={"file":("case.jpg", sample_file(), "image/jpeg")}, data={"sequence":"T1C+"})
    assert response.status_code == 200, response.text
    case = response.json()
    assert case["ml"]["status"] == "ready"
    stored = client.get(f"/sessions/{case['sessionId']}").json()
    assert stored["histogram_data"] == case["histogram_data"]
    assert stored["metrics"]["initial_metrics"] == case["metrics"]["initial_metrics"]
    assert stored["step_images"] == case["step_images"]
    assert stored["ml"] == case["ml"]
    notes = "Comparison requires review. <not markup>"
    assert client.put(f"/sessions/{case['sessionId']}/notes",json={"notes":notes}).status_code == 200
    assert client.get(f"/sessions/{case['sessionId']}").json()["notes"] == notes
    preview = client.post("/process", files={"file":("preview.jpg",sample_file(),"image/jpeg")}, data={"persist":"false","include_ml":"false"}).json()
    assert preview["ml"]["status"] == "skipped"
    assert client.get(f"/sessions/{preview['sessionId']}").status_code == 404


def test_database_survives_another_process(monkeypatch):
    import os
    payload={"sessionId":"persist-test", "filename":"test.jpg", "metrics":{"initial_metrics":{"mean":42}}, "histogram_data":{"raw":[1,2]}, "step_images":{"raw":"data:image/png;base64,AA=="}, "ml":{"status":"ready"}}
    save_case(payload)
    command="import json; from storage import get_case; print(json.dumps(get_case('persist-test')))"
    result=subprocess.run([sys.executable,"-c",command],cwd=ROOT/"python_service",env=os.environ.copy(),capture_output=True,text=True,check=True)
    assert json.loads(result.stdout)["histogram_data"] == payload["histogram_data"]


@pytest.mark.parametrize("params", [{"median_kernel":"4"},{"gamma":"-1"},{"butterworth_order":"0"},{"sequence":"invalid"},{"pipeline_mode":"unknown"}])
def test_invalid_analysis_parameters_are_rejected(params):
    response=client.post("/process",files={"file":("case.jpg",sample_file(),"image/jpeg")},data=params)
    assert response.status_code == 422


def test_cohort_filters_pagination_and_opaque_image_ids():
    data=client.get("/cohort",params={"sequence":"T1","limit":10}).json()
    assert data["total"] == 23
    assert len(data["items"]) == 10
    assert all(item["disease"]=="Medulloblastoma" and item["sequence"]=="T1" for item in data["items"])
    image=client.get(f"/cohort/{data['items'][0]['id']}/image?thumbnail=true")
    assert image.status_code==200
    with Image.open(io.BytesIO(image.content)) as preview:
        assert max(preview.size)<=320
    assert client.get("/cohort/not-a-valid-id/image").status_code==404


def test_dicom_uint16_normalization_and_multiframe_rejection():
    from pydicom.dataset import FileDataset, FileMetaDataset
    from pydicom.uid import ExplicitVRLittleEndian, generate_uid, SecondaryCaptureImageStorage
    meta=FileMetaDataset()
    meta.TransferSyntaxUID=ExplicitVRLittleEndian
    meta.MediaStorageSOPClassUID=SecondaryCaptureImageStorage
    meta.MediaStorageSOPInstanceUID=generate_uid()
    dataset=FileDataset(None, {}, file_meta=meta, preamble=b"\0"*128)
    dataset.Rows=32; dataset.Columns=32; dataset.SamplesPerPixel=1
    dataset.PhotometricInterpretation="MONOCHROME2"
    dataset.BitsAllocated=16; dataset.BitsStored=16; dataset.HighBit=15; dataset.PixelRepresentation=0
    dataset.PixelData=np.arange(1024,dtype=np.uint16).reshape(32,32).tobytes()
    buffer=io.BytesIO();dataset.save_as(buffer,enforce_file_format=True)
    decoded=bytes_to_numpy(buffer.getvalue())
    assert decoded.min()==0 and decoded.max()==255
    dataset.NumberOfFrames=2
    buffer=io.BytesIO();dataset.save_as(buffer,enforce_file_format=True)
    with pytest.raises(ValueError,match="single-frame"):
        bytes_to_numpy(buffer.getvalue())


def test_pdf_includes_separate_ml_and_notes():
    response=client.post("/process",files={"file":("case.jpg",sample_file(),"image/jpeg")},data={"persist":"false"})
    case=response.json();case["step_images_b64"]=case.pop("step_images");case["notes"]="Keep <these> observations."
    report=client.post("/report/pdf",json=case)
    assert report.status_code==200
    assert report.content.startswith(b"%PDF-")


def test_insufficient_quality_does_not_return_a_prediction():
    result = predict(np.zeros((64,64), dtype=np.uint8))
    assert result["status"] == "insufficient_quality"
    assert result["predictions"] == []


def test_uniform_image_has_no_sobel_edges():
    from pipeline.edges import edge_detection_suite
    result = edge_detection_suite(np.full((64,64),128,dtype=np.uint8))
    assert not np.any(result["sobel"]["binary_mask"])


def test_perfect_recovery_represents_infinite_psnr_without_a_fake_number():
    from metrics.filtering_metrics import compute_mse_psnr
    image = np.full((32,32),100,dtype=np.uint8)
    result = compute_mse_psnr(image,image)
    assert result["exact_match"] and result["psnr"] is None and result["mse"] == 0


def test_saved_batch_history_restores_results():
    payload={"batchId":"history-test", "total_files":2,"successful":1,"failed":1,"results":[{"filename":"case.jpg","success":True}]}
    assert client.post("/batches",json=payload).status_code==200
    assert client.get("/batches").json()["batches"][0]["batchId"]=="history-test"
    assert client.get("/batches/history-test").json()==payload
