"""Read/write smoke checks against the local Express + Python stack, no browser.

Start the scientific engine with a disposable MEDULLOSIGHT_DB before running.
"""
import csv
import io
from pathlib import Path
import zipfile
import httpx

ROOT = Path(__file__).resolve().parent.parent


def main():
    with httpx.Client(base_url="http://127.0.0.1:5000", timeout=120) as client:
        response=client.get("/"); response.raise_for_status()
        assert "Medulloblastoma MRI Research Workspace" in response.text
        health=client.get("/api/health");health.raise_for_status()
        assert health.json()["storage"]=="sqlite"
        evaluation=client.get("/api/models").json()
        assert len(evaluation["models"])==4
        cohort=client.get("/api/cohort",params={"sequence":"T2","limit":2}).json()
        assert cohort["total"]==41
        response=client.get(cohort["items"][0]["image_url"]);response.raise_for_status()
        response=client.post("/api/analyze/cohort",json={"image_id":cohort["items"][0]["id"]})
        response.raise_for_status();case=response.json()
        assert case["source"]["dataset_label"]=="Medulloblastoma"
        assert len(case["ml"]["predictions"])==4
        stored=client.get(f"/api/sessions/{case['sessionId']}").json()
        assert stored["histogram_data"]==case["histogram_data"]
        assert stored["step_images"]==case["step_images"]
        response=client.put(f"/api/sessions/{case['sessionId']}/notes",json={"notes":"Stack verification case"})
        response.raise_for_status()
        assert client.get(f"/api/sessions/{case['sessionId']}").json()["notes"]=="Stack verification case"
        payload={**case,"step_images_b64":case["step_images"],"notes":"Stack verification case"}
        pdf=client.post("/api/report/pdf",json=payload);pdf.raise_for_status()
        assert pdf.content.startswith(b"%PDF-")
        sample=(ROOT/"client/public/mri/MB04_T1C.jpg").read_bytes()
        batch=client.post("/api/analyze/batch",files=[("files",("=cohort.jpg",sample,"image/jpeg")),("files",("invalid.png",b"not an image","image/png"))],data={"sequence":"T1C+"})
        batch.raise_for_status();batch=batch.json()
        assert batch["successful"]==1 and batch["failed"]==1
        csv_response=client.get(f"/api/export/csv/{batch['batchId']}");csv_response.raise_for_status()
        rows=list(csv.reader(io.StringIO(csv_response.text)))
        assert "RawMobileNetScore" in rows[0]
        assert rows[1][0].startswith("'") # spreadsheet formula escaping
        assert len(rows[0])==len(rows[1])
        archive=client.get(f"/api/export/zip/{batch['batchId']}");archive.raise_for_status()
        with zipfile.ZipFile(io.BytesIO(archive.content)) as files:
            assert len(files.namelist())>=22
            assert all(not name.startswith(("/","..")) for name in files.namelist())
        invalid=client.post("/api/analyze/single",files={"file":("x.jpg",sample,"image/jpeg")},data={"gamma":"-1"})
        assert invalid.status_code==422
        assert client.get("/api/export/csv/no-such-batch").status_code==404
        print("Stack checks passed: built UI, health, cohort, four-model inference, persisted cases/notes, PDF, mixed-success batch, safe CSV, ZIP, and validation.")


if __name__=="__main__":
    main()
