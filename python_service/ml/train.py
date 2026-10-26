"""Train paired SVM and frozen MobileNetV2 classifiers on frozen group splits.

Run from repository root: python python_service/ml/train.py --archive PATH
"""
import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "python_service"))
import joblib
import numpy as np
from PIL import Image
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, average_precision_score, balanced_accuracy_score,
                             confusion_matrix, precision_recall_curve, precision_recall_fscore_support,
                             roc_auc_score, roc_curve)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC
from ml.features import PREPROCESSING_VERSION, prepare_image, extract_features


def frozen_split(records, audit):
    parents = {r["path"]: r["path"] for r in records}
    def find(x):
        while parents[x] != x:
            parents[x] = parents[parents[x]]
            x = parents[x]
        return x
    def union(a, b):
        a, b = find(a), find(b)
        if a != b:
            parents[max(a, b)] = min(a, b)
    for group in audit["pixel_duplicate_groups"]:
        for path in group["paths"][1:]:
            union(group["paths"][0], path)
    for pair in json.loads((ROOT / "research/dataset_audit/near_duplicate_candidates.json").read_text()):
        union(pair["first"], pair["second"])
    groups = defaultdict(list)
    for r in records:
        groups[find(r["path"])].append(r)
    demo_roots = {find(path) for m in audit["notebook_matches"] for path in m["archive_matches"]}
    seen = set()
    usable = []
    for r in records:
        r["group"] = hashlib.sha256(find(r["path"]).encode()).hexdigest()[:16]
        r["target"] = int(r["disease_label"] == "Meduloblastoma")
        if len({x["disease_label"] for x in groups[find(r["path"]) ]}) > 1:
            r["split"] = "review"
        elif r["pixel_sha256"] in seen:
            r["split"] = "duplicate"
        elif find(r["path"]) in demo_roots:
            r["split"] = "demonstration"
        else:
            usable.append(r)
        seen.add(r["pixel_sha256"])
    y = np.array([r["target"] for r in usable])
    group_ids = np.array([r["group"] for r in usable])
    # Both label and sequence are stratified where group structure permits.
    strata = np.array([f"{r['target']}_{r['sequence']}" for r in usable])
    dev, test = next(StratifiedGroupKFold(5, shuffle=True, random_state=33).split(y, strata, group_ids))
    train_local, val_local = next(StratifiedGroupKFold(4, shuffle=True, random_state=34).split(y[dev], strata[dev], group_ids[dev]))
    for name, indices in [("train", dev[train_local]), ("validation", dev[val_local]), ("test", test)]:
        for i in indices:
            usable[i]["split"] = name
    for split in ["train", "validation", "test"]:
        if len({r["target"] for r in usable if r["split"] == split}) != 2:
            raise ValueError(f"Group split {split} has only one class")
    assigned = {}
    for r in usable:
        if r["group"] in assigned and assigned[r["group"]] != r["split"]:
            raise AssertionError("Group leakage")
        assigned[r["group"]] = r["split"]
    return records


def scores(y, probability, threshold):
    prediction = probability >= threshold
    precision, recall, f1, _ = precision_recall_fscore_support(y, prediction, average="binary", zero_division=0)
    cm = confusion_matrix(y, prediction, labels=[0, 1]).tolist()
    result = {"n": len(y), "positive_n": int(sum(y)), "accuracy": accuracy_score(y, prediction),
              "balanced_accuracy": balanced_accuracy_score(y, prediction), "precision": precision,
              "recall": recall, "f1": f1, "specificity": cm[0][0] / max(1, sum(cm[0])),
              "confusion_matrix": cm}
    if len(set(y)) == 2:
        result.update(pr_auc=float(average_precision_score(y, probability)), roc_auc=float(roc_auc_score(y, probability)))
        p, r, _ = precision_recall_curve(y, probability)
        fpr, tpr, _ = roc_curve(y, probability)
        result["pr_curve"] = [[float(r[i]), float(p[i])] for i in np.linspace(0, len(p)-1, min(60, len(p))).astype(int)]
        result["roc_curve"] = [[float(fpr[i]), float(tpr[i])] for i in np.linspace(0, len(fpr)-1, min(60, len(fpr))).astype(int)]
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--transfer", action="store_true", help="Also fit pretrained MobileNetV2 feature classifiers")
    args = parser.parse_args()
    output = ROOT / "python_service/artifacts"
    output.mkdir(exist_ok=True)
    os.environ["TORCH_HOME"] = str(output / "torch-cache")
    audit = json.loads((ROOT / "research/dataset_audit/summary.json").read_text())
    if audit.get("archive_sha256") and hashlib.file_digest(args.archive.open("rb"), "sha256").hexdigest() != audit["archive_sha256"]:
        raise ValueError("The archive differs from the audited dataset. Re-run the audit before training.")
    rows = [json.loads(x) for x in (ROOT / "research/dataset_audit/manifest.jsonl").read_text().splitlines()]
    rows = frozen_split(rows, audit)
    (output / "splits.json").write_text(json.dumps(rows), encoding="utf-8")
    (output / "dataset.json").write_text(json.dumps({"archive": str(args.archive.resolve()), "audit": audit}), encoding="utf-8")
    selected = [r for r in rows if r["split"] in {"train", "validation", "test"}]
    cache_path = output / "features.npz"
    identity = hashlib.sha256(json.dumps([(r["path"], r["pixel_sha256"]) for r in selected]).encode() + PREPROCESSING_VERSION.encode()).hexdigest()
    have_cache = False
    if cache_path.exists():
        cache = np.load(cache_path)
        have_cache = str(cache["identity"]) == identity
    if have_cache:
        features = {v: cache[v] for v in ["raw", "sip"]}
    else:
        features = {"raw": [], "sip": []}
        with zipfile.ZipFile(args.archive) as archive:
            for i, r in enumerate(selected):
                raw = np.array(Image.open(io.BytesIO(archive.read(r["path"]))).convert("L"))
                for variant in features:
                    features[variant].append(extract_features(prepare_image(raw, variant)))
                if i % 250 == 0:
                    print(f"Feature extraction {i}/{len(selected)}", flush=True)
        features = {v: np.array(f) for v, f in features.items()}
        np.savez_compressed(cache_path, **features, identity=identity)
    embeddings = {}
    if args.transfer:
        import torch
        from torchvision.models import mobilenet_v2, MobileNet_V2_Weights
        torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))
        weights_path = output / "mobilenet_v2_backbone.pt"
        backbone = mobilenet_v2(weights=None)
        if weights_path.exists():
            backbone.load_state_dict(torch.load(weights_path, map_location="cpu", weights_only=True))
        else:
            backbone = mobilenet_v2(weights=MobileNet_V2_Weights.IMAGENET1K_V2)
            torch.save(backbone.state_dict(), weights_path)
        backbone.classifier = torch.nn.Identity()
        backbone.eval()
        embed_cache = output / "embeddings.npz"
        cached = np.load(embed_cache) if embed_cache.exists() else None
        if cached is not None and str(cached["identity"]) == identity:
            embeddings = {v: cached[v] for v in ["raw", "sip"]}
        else:
            embeddings = {"raw": [], "sip": []}
            mean = torch.tensor([.485,.456,.406])[None,:,None,None]
            std = torch.tensor([.229,.224,.225])[None,:,None,None]
            with zipfile.ZipFile(args.archive) as archive, torch.inference_mode():
                for start in range(0, len(selected), 24):
                    batch = [np.array(Image.open(io.BytesIO(archive.read(r["path"]))).convert("L")) for r in selected[start:start+24]]
                    for variant in embeddings:
                        inputs = torch.from_numpy(np.stack([prepare_image(r, variant) for r in batch]).copy()).float()[:,None,:,:].repeat(1,3,1,1) / 255
                        inputs = torch.nn.functional.interpolate(inputs, size=(224,224), mode="bilinear", align_corners=False)
                        embeddings[variant].extend(backbone((inputs - mean) / std).numpy())
                    if start % 240 == 0:
                        print(f"MobileNetV2 embeddings {start}/{len(selected)}", flush=True)
            embeddings = {v: np.array(f) for v, f in embeddings.items()}
            np.savez_compressed(embed_cache, **embeddings, identity=identity)
    y = np.array([r["target"] for r in selected])
    idx = {split: np.array([i for i, r in enumerate(selected) if r["split"] == split]) for split in ["train", "validation", "test"]}
    group_ids = np.array([r["group"] for r in selected])
    models, evaluations = {}, []
    families = [("svm", features)] + ([("mobilenet", embeddings)] if embeddings else [])
    for family, data in families:
        for variant, x in data.items():
            key = f"{family}_{variant}"
            print(f"Training {key}", flush=True)
            if family == "svm":
                folds = list(StratifiedGroupKFold(3, shuffle=True, random_state=35).split(x[idx['train']], y[idx['train']], group_ids[idx['train']]))
                model = CalibratedClassifierCV(make_pipeline(StandardScaler(), LinearSVC(C=.1, class_weight="balanced", max_iter=15000, random_state=33)), cv=folds, method="sigmoid")
            else:
                model = make_pipeline(StandardScaler(), LogisticRegression(C=.1, class_weight="balanced", max_iter=2000, random_state=33))
            model.fit(x[idx["train"]], y[idx["train"]])
            validation_p = model.predict_proba(x[idx["validation"]])[:,1]
            p, r, thresholds = precision_recall_curve(y[idx["validation"]], validation_p)
            f1 = 2*p*r / np.maximum(p+r, 1e-12)
            threshold = float(thresholds[int(np.argmax(f1[:-1]))])
            test_p = model.predict_proba(x[idx["test"]])[:,1]
            result = {"id": key, "family": family, "variant": variant, "threshold": threshold,
                      "validation": scores(y[idx["validation"]], validation_p, threshold),
                      "test": scores(y[idx["test"]], test_p, threshold), "by_sequence": {}}
            for sequence in ["T1", "T1C+", "T2"]:
                mask = np.array([selected[i]["sequence"] == sequence for i in idx["test"]])
                if mask.any():
                    result["by_sequence"][sequence] = scores(y[idx["test"]][mask], test_p[mask], threshold)
            result["test_predictions"] = [{"path": selected[i]["path"], "label": int(y[i]), "score": float(prob), "image_id": hashlib.sha256(selected[i]["path"].encode()).hexdigest()[:20], "sequence": selected[i]["sequence"]} for i, prob in zip(idx["test"], test_p)]
            evaluations.append(result)
            models[key] = {"estimator": model, "threshold": threshold, "family": family, "variant": variant}
    # The default is selected using validation F1 exclusively, not held-out test results.
    default = max(evaluations, key=lambda r: r["validation"]["f1"])["id"]
    version = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    metrics = {"version": version, "preprocessing_version": PREPROCESSING_VERSION, "default_model": default,
               "task": "Medulloblastoma versus other supplied categories", "positive_label": "Medulloblastoma",
               "models": evaluations, "split_counts": dict(Counter(r["split"] for r in rows)),
               "split_class_counts": {s: dict(Counter("Medulloblastoma" if r["target"] else "Other" for r in rows if r["split"] == s)) for s in ["train","validation","test","demonstration","review","duplicate"]},
               "grouping": "Exact decoded pixels and pHash distance <=4 connected components; mixed-label components quarantined; original notebook groups excluded from training and evaluation.",
               "patient_level_validated": False, "seed": 33,
               "limitations": ["Patient identities unavailable; similarity grouping does not establish patient independence.", "Dataset folder labels have not been independently clinically verified.", "No ground-truth tumour masks; classification does not validate the classical ROI.", "Image-level experimental results; no clinical validation or guaranteed rejection of unrelated images."],
               "training": {"svm": "StandardScaler + balanced LinearSVC C=0.1; 3 group-fold sigmoid calibration on training only", "mobilenet": "Frozen ImageNet MobileNetV2 embeddings + balanced logistic regression C=0.1; no backbone fine-tuning", "threshold": "Maximum validation F1", "selection": "Maximum validation F1", "augmentation": "None", "split_fingerprint": identity}}
    joblib.dump({"models": models, "default": default, "version": version, "preprocessing_version": PREPROCESSING_VERSION}, output / "classifiers.joblib")
    (output / "evaluation.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    public = ROOT / "client/public/research"
    public.mkdir(parents=True, exist_ok=True)
    (public / "evaluation.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps({"default": default, "splits": metrics["split_counts"], "results": [{"id":r["id"], "validation_f1":r["validation"]["f1"], "test_f1":r["test"]["f1"]} for r in evaluations]}, indent=2), flush=True)


if __name__ == "__main__":
    main()
