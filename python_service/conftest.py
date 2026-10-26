"""
Pytest configuration for MedulloSight test suite.
Ensures python_service directory is in sys.path during test discovery.
"""

from pathlib import Path
import sys
import pytest

_SERVICE_DIR = str(Path(__file__).resolve().parent)
if _SERVICE_DIR not in sys.path:
    sys.path.insert(0, _SERVICE_DIR)


@pytest.fixture(autouse=True)
def isolated_database(tmp_path, monkeypatch):
    monkeypatch.setenv("MEDULLOSIGHT_DB", str(tmp_path / "cases.sqlite3"))
