# MedulloSight

A medulloblastoma-focused MRI research workspace combining the original classical SIP study with experimental machine-learning classification.

## Run locally

The trained classifiers and their evaluation artifacts are already included in `python_service/artifacts/`. The dataset ZIP is read directly, without extraction. Its current location is recorded in `python_service/artifacts/dataset.json`.

From this directory, on Windows with Python 3.11+ and Node 20+:

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r python_service/requirements.txt
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

Open **http://127.0.0.1:5173**. React uses a Vite proxy to Express on port 5000, which forwards scientific requests to FastAPI on port 8000. Start all three services together; a frontend-only preview cannot run new analyses.

To serve the built frontend from Express instead:

```powershell
npm run build:client
# Terminal 1:
npm run dev:py
# Terminal 2:
npm start
```

Open **http://127.0.0.1:5000**. The completed application uses relative API URLs. Configure `VITE_API_BASE_URL` only when intentionally deploying the API elsewhere.

## The experience

- **The study:** a complete presentation with real MRI comparisons, a processing-stage player, the original cohort, methods, team, and measured model evaluation.
- **Overview:** populated notebook examples, dataset counts, experimental results, and saved research history.
- **Case analysis:** upload or choose a cohort image; inspect, zoom, pan and read pixels; compare stages; view four experimental predictions; save notes and export PDF/JSON.
- **Cohort explorer:** all 4,479 source images, defaulting to the 131 medulloblastoma-labelled images; filter by category, sequence and experimental split, with pagination.
- **Experiment lab:** re-run classical processing with adjustable parameters, compare stages and conduct a reference-based noise experiment. Preview runs are not persisted unless explicitly saved.
- **Model evaluation:** raw/SIP comparison, confusion matrices, PR/ROC curves, sequence-level results, split counts and methodological limits.
- **Research:** documented differences between the original notebook, classical web paths, and ML preprocessing.
- **Batch & export:** process up to 20 slices, save successful cases, and download classical/ML metrics CSV or an image ZIP. Batch exports remain available after server restarts.

## The models and data split

The primary task is **medulloblastoma versus the other supplied categories**, not 44-class tumour diagnosis. The dataset's 44 folders combine category and sequence labels. Supplied diagnoses have not been independently clinically verified.

Four models were trained locally:

1. Intensity/texture/HOG/DCT features + calibrated balanced Linear SVM, raw input.
2. The same SVM workflow, fixed SIP input.
3. Frozen ImageNet MobileNetV2 embeddings + trained balanced logistic regression, raw input.
4. The same transfer workflow, fixed SIP input. The backbone is **not fine-tuned**.

Training/inference share `ml/features.py`. The fixed `sip-ml-v1` preprocessing retains aspect ratio, resizes/pads to 192 square, stretches P1/P99 intensities, applies gamma 0.5, and median-filters with a 3x3 kernel. MobileNet inputs are then interpolated to 224 square and ImageNet-normalized.

Exact decoded-pixel duplicates and pHash-similarity connected groups are kept within one split. Mixed-category similarity groups are quarantined for review. The original ten notebook images and their similarity groups are reserved demonstrations. This yields 2,589 training, 862 validation, and 863 test images, plus 17 demonstrations, 98 review images and 50 duplicate copies.

The scaler, classifier and SVM calibration are fitted on training data. Validation F1 selects each decision threshold and the default classifier. Test results do not change that selection. No augmentation was used. Only 22 medulloblastoma-labelled images occur in the held-out test set; patient-level independence is unverified.

See `python_service/artifacts/evaluation.json`, `splits.json`, `MODEL_CARD.md`, and `research/dataset_audit/REPORT.md` for the evidence. Read the app's evaluation screen before interpreting aggregate accuracy.

Retrain, retaining the deterministic grouping/split policy:

```powershell
npm run train:ml -- "C:\Users\ASUS\Downloads\archive (2).zip"
```

The first transfer run downloads the pretrained backbone into the project's artifact cache. Serving an existing trained artifact never downloads weights. Serialized model files are trusted local build artifacts; do not replace them with untrusted files.

Refresh precomputed notebook demonstrations after changing the classical path or retraining:

```powershell
.venv/Scripts/python.exe scripts/build_demonstrations.py
npm run build:client
```

## Database and configuration

SQLite is the default database, located at `python_service/data/medullosight.sqlite3`. No MongoDB server is needed. Complete cases—including images, detailed metrics, histograms, model outputs, parameters, provenance, and notes—and batch records persist in SQLite. Parameterized queries and WAL mode are used. No automatic case deletion is performed.

Set environment variables in the shell before launching the services:

```powershell
$env:DATASET_ARCHIVE = 'D:\datasets\archive (2).zip'
$env:MEDULLOSIGHT_DB = 'D:\research\medullosight.sqlite3'
# Optional gateway settings:
$env:PYTHON_SERVICE_URL = 'http://127.0.0.1:8000'
$env:PORT = '5000'
```

`DATASET_ARCHIVE` overrides the saved ZIP location. `MEDULLOSIGHT_DB` overrides the database path. Back up the database using SQLite's backup API, or stop the service before copying it (account for WAL files when copying an active database). Keep dataset/model/data artifacts together when moving the app. The database and feature caches are ignored by Git.

## Classical processing and supported files

The default `notebook-v1` dataflow is contrast stretch → median → Otsu → opening → largest component → closing. Gamma, histogram equalization and FFT are separate inspection branches. `experimental-v2` sends gamma → median → Butterworth low-pass into Otsu. Both paths are named and recorded per case.

The implementation uses SciPy/Pillow equivalents and a plateau-midpoint Otsu convention. Notebook-aligned means aligned dataflow; it does not claim bit-identical OpenCV outputs. The original notebook and paper findings are not rewritten as ML findings.

JPEG, PNG, WebP, TIFF, BMP and single-frame grayscale DICOM slices are supported. DICOM modality/VOI transforms and MONOCHROME1 inversion are handled; a decoder dependency may be required for compressed transfer syntaxes. Multi-frame DICOM is rejected explicitly. High-bit-depth raster inputs are normalized, rather than saturated to 255. Maximum upload size is 30 MB and 4 megapixels; minimum dimensions are 16 square.

## Verification

```powershell
npm run build:client
npm run test:api
# With Express and FastAPI running, against a disposable database:
.venv/Scripts/python.exe scripts/verify_stack.py
# Component rendering without a browser:
node client/scripts/verify-render.mjs
```

Tests exercise classical operations, image decoding/DICOM, invalid parameters, group leakage, model inference, full case/notes persistence, cross-process storage, cohort filters and PDFs. The stack check also exercises Express, mixed-success batches, formula-safe CSV and ZIP export. It intentionally writes verification cases, so run it with an isolated `MEDULLOSIGHT_DB`.

Repository policy prohibits browser verification. Responsive styles and keyboard controls are implemented, but no browser visual or interaction QA has been claimed.

## Scope

Research and education only. Class scores are not validated clinical probabilities. The app does not establish tumour presence, anatomical location, diagnosis or patient outcomes, and does not reliably reject unrelated images. The classical candidate ROI is not a ground-truth tumour contour. No expert masks or verified patient grouping were supplied, so clinical and patient-level validation remain unresolved.

Research team: Mahirie Shah (I033), Shubham Jatania (I034), Krish Karanpuria (I035).
