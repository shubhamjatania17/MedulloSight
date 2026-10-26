"""Complete case and batch persistence in a local SQLite database."""
from contextlib import contextmanager
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sqlite3

DEFAULT_DB = Path(__file__).resolve().parent / "data/medullosight.sqlite3"


@contextmanager
def connection():
    path = Path(os.environ.get("MEDULLOSIGHT_DB", DEFAULT_DB))
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL)")
    conn.execute("CREATE TABLE IF NOT EXISTS batches (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, payload TEXT NOT NULL)")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def save_case(payload):
    payload.setdefault("createdAt", datetime.now(timezone.utc).isoformat())
    payload.setdefault("notes", "")
    with connection() as conn:
        conn.execute("INSERT INTO cases VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
                     (payload["sessionId"], payload["createdAt"], json.dumps(payload, allow_nan=False)))
    return payload


def get_case(case_id):
    with connection() as conn:
        row = conn.execute("SELECT payload FROM cases WHERE id=?", (case_id,)).fetchone()
    return json.loads(row[0]) if row else None


def list_cases(limit=40):
    with connection() as conn:
        rows = conn.execute("SELECT payload FROM cases ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    fields = {"sessionId", "filename", "sequence", "dimensions", "total_duration_ms", "metrics", "warnings", "createdAt", "ml", "notes", "pipeline_version"}
    return [{k:v for k,v in json.loads(row[0]).items() if k in fields} for row in rows]


def save_batch(payload):
    with connection() as conn:
        conn.execute("INSERT INTO batches VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
                     (payload["batchId"], datetime.now(timezone.utc).isoformat(), json.dumps(payload, allow_nan=False)))


def get_batch(batch_id):
    with connection() as conn:
        row = conn.execute("SELECT payload FROM batches WHERE id=?", (batch_id,)).fetchone()
    return json.loads(row[0]) if row else None


def list_batches(limit=20):
    with connection() as conn:
        rows = conn.execute("""SELECT id AS batchId, created_at AS createdAt,
            json_extract(payload, '$.total_files') AS total_files,
            json_extract(payload, '$.successful') AS successful,
            json_extract(payload, '$.failed') AS failed
            FROM batches ORDER BY created_at DESC LIMIT ?""", (limit,)).fetchall()
    return [dict(row) for row in rows]
