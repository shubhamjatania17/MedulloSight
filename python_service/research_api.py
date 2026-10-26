"""Cohort access by opaque ID; ZIP member names never come from requests."""
from functools import lru_cache
import hashlib
import io
import json
import os
from pathlib import Path
import zipfile
from fastapi import APIRouter, HTTPException, Query, Response
from PIL import Image, ImageOps
from pydantic import BaseModel, Field
from ml.inference import ARTIFACTS
from storage import get_case, list_cases, save_case, get_batch, save_batch, list_batches

router = APIRouter()
ROOT = Path(__file__).resolve().parent.parent
NAMES = {"Meduloblastoma":"Medulloblastoma", "Ependimoma":"Ependymoma", "Astrocitoma":"Astrocytoma", "Neurocitoma":"Neurocytoma", "Papiloma":"Papilloma", "_NORMAL":"Normal"}


@lru_cache(maxsize=2)
def catalog(version):
    path = ARTIFACTS / "splits.json"
    if not path.exists():
        path = ROOT / "research/dataset_audit/manifest.jsonl"
        records = [json.loads(x) for x in path.read_text().splitlines()]
    else:
        records = json.loads(path.read_text())
    for row in records:
        row["id"] = hashlib.sha256(row["path"].encode()).hexdigest()[:20]
        row["disease"] = NAMES.get(row["disease_label"], row["disease_label"])
        row["image_url"] = f"/api/cohort/{row['id']}/image"
        row.setdefault("split", "unassigned")
    return {r["id"]: r for r in records}


def records():
    path = ARTIFACTS / "splits.json"
    return catalog(path.stat().st_mtime_ns if path.exists() else 0)


def image_bytes(image_id):
    record = records().get(image_id)
    if not record:
        raise HTTPException(404, "Cohort image not found")
    config = ARTIFACTS / "dataset.json"
    configured = json.loads(config.read_text())["archive"] if config.exists() else str(ROOT.parent / "archive (2).zip")
    path = Path(os.environ.get("DATASET_ARCHIVE", configured))
    if not path.is_file():
        raise HTTPException(503, "Dataset ZIP is unavailable. Set DATASET_ARCHIVE to its location.")
    with zipfile.ZipFile(path) as archive:
        data = archive.read(record["path"])
    if hashlib.sha256(data).hexdigest() != record["sha256"]:
        raise HTTPException(409, "Dataset member changed since audit; re-audit before analysis.")
    return data, record


@router.get("/cohort")
def cohort(disease: str = "Medulloblastoma", sequence: str = "All", split: str = "All",
           q: str = "", page: int = Query(1, ge=1), limit: int = Query(18, ge=1, le=60)):
    all_rows = list(records().values())
    rows = [r for r in all_rows if (disease == "All" or r["disease"] == disease)
            and (sequence == "All" or r["sequence"] == sequence) and (split == "All" or r["split"] == split)
            and q.lower() in r["path"].lower()]
    public_fields = {"id","disease","sequence","width","height","mode","split","image_url"}
    return {"items": [{k:v for k,v in r.items() if k in public_fields} for r in rows[(page-1)*limit:page*limit]],
            "total": len(rows), "page": page, "pages": max(1, (len(rows)+limit-1)//limit),
            "diseases": sorted({r["disease"] for r in all_rows})}


@router.get("/cohort/summary")
def cohort_summary():
    from collections import Counter
    rows = list(records().values())
    med = [r for r in rows if r["disease"] == "Medulloblastoma"]
    return {"total":len(rows), "medulloblastoma":len(med), "categories":len({r["disease"] for r in rows}),
            "disease_counts":dict(Counter(r["disease"] for r in rows)),
            "medulloblastoma_sequences":dict(Counter(r["sequence"] for r in med)),
            "split_counts":dict(Counter(r["split"] for r in rows)),
            "patient_level_validated":False,"segmentation_masks":False}


@router.get("/cohort/{image_id}/image")
def cohort_image(image_id: str, thumbnail: bool = False):
    data, _ = image_bytes(image_id)
    with Image.open(io.BytesIO(data)) as image:
        rgb = ImageOps.exif_transpose(image).convert("RGB")
        if thumbnail:
            rgb.thumbnail((320,320))
        buffer = io.BytesIO()
        rgb.save(buffer, "JPEG", quality=90)
    return Response(buffer.getvalue(), media_type="image/jpeg", headers={"Cache-Control":"private, max-age=86400"})


@router.get("/models")
def model_evaluation():
    path = ARTIFACTS / "evaluation.json"
    if not path.exists():
        return {"status":"unavailable", "models":[], "message":"No trained model artifact is installed."}
    return {"status":"ready", **json.loads(path.read_text())}


@router.get("/sessions")
def sessions():
    return {"sessions":list_cases(), "storage":"sqlite"}


@router.get("/sessions/{case_id}")
def session(case_id: str):
    result = get_case(case_id)
    if not result:
        raise HTTPException(404, "Case not found")
    return result


class Notes(BaseModel):
    notes: str = Field(max_length=10000)


@router.put("/sessions/{case_id}/notes")
def notes(case_id: str, body: Notes):
    result = session(case_id)
    result["notes"] = body.notes
    save_case(result)
    return {"notes":body.notes}


@router.post("/batches")
def store_batch(body: dict):
    if not isinstance(body.get("batchId"), str) or not isinstance(body.get("results"), list):
        raise HTTPException(422, "batchId and results are required")
    save_batch(body)
    return {"saved":True}


@router.get("/batches/{batch_id}")
def batch(batch_id: str):
    result = get_batch(batch_id)
    if not result:
        raise HTTPException(404, "Batch not found")
    return result


@router.get("/batches")
def batches():
    return {"batches":list_batches()}
