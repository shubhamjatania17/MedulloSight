"""Load only locally trained artifacts; inference never downloads weights."""
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import numpy as np
from ml.features import prepare_image, extract_features, PREPROCESSING_VERSION

ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts"


@lru_cache(maxsize=2)
def load_bundle(modified):
    import joblib
    bundle = joblib.load(ARTIFACTS / "classifiers.joblib")
    if bundle["preprocessing_version"] != PREPROCESSING_VERSION:
        raise RuntimeError("Model preprocessing version mismatch; retrain before inference")
    return bundle


@lru_cache(maxsize=2)
def backbone(modified):
    import torch
    from torchvision.models import mobilenet_v2
    torch.set_num_threads(4)
    model = mobilenet_v2(weights=None)
    model.load_state_dict(torch.load(ARTIFACTS / "mobilenet_v2_backbone.pt", map_location="cpu", weights_only=True))
    model.classifier = torch.nn.Identity()
    return model.eval()


def embedding(gray):
    import torch
    path = ARTIFACTS / "mobilenet_v2_backbone.pt"
    model = backbone(path.stat().st_mtime_ns)
    x = torch.from_numpy(gray.copy()).float()[None,None,:,:].repeat(1,3,1,1) / 255
    x = torch.nn.functional.interpolate(x, size=(224,224), mode="bilinear", align_corners=False)
    mean = torch.tensor([.485,.456,.406])[None,:,None,None]
    std = torch.tensor([.229,.224,.225])[None,:,None,None]
    with torch.inference_mode():
        return model((x-mean)/std).numpy()


@lru_cache(maxsize=2)
def known_images(modified):
    path = ARTIFACTS / "splits.json"
    return {r["pixel_sha256"]: r["split"] for r in json.loads(path.read_text())}


def predict(raw):
    if float(np.std(raw)) < 2 or min(raw.shape[:2]) < 32:
        return {"status":"insufficient_quality", "message":"This input has insufficient intensity variation or spatial resolution for experimental classification.", "predictions":[]}
    path = ARTIFACTS / "classifiers.joblib"
    if not path.exists():
        return {"status": "unavailable", "message": "Train classifiers using npm run train:ml before inference.", "predictions": []}
    bundle = load_bundle(path.stat().st_mtime_ns)
    inputs, predictions = {}, []
    for key, model in bundle["models"].items():
        variant = model["variant"]
        if variant not in inputs:
            inputs[variant] = prepare_image(raw, variant)
        gray = inputs[variant]
        x = extract_features(gray)[None,:] if model["family"] == "svm" else embedding(gray)
        probability = float(model["estimator"].predict_proba(x)[0,1])
        predictions.append({"id": key, "family": model["family"], "variant": variant,
                            "score": probability, "threshold": model["threshold"],
                            "label": "Medulloblastoma-like" if probability >= model["threshold"] else "Other-class-like"})
    from PIL import Image
    rgb = Image.fromarray(raw).convert("RGB")
    fingerprint = hashlib.sha256(f"{rgb.width}x{rgb.height}:RGB:".encode() + rgb.tobytes()).hexdigest()
    splits_path = ARTIFACTS / "splits.json"
    split = known_images(splits_path.stat().st_mtime_ns).get(fingerprint) if splits_path.exists() else None
    return {"status": "ready", "model_version": bundle["version"], "preprocessing_version": PREPROCESSING_VERSION,
            "default_model": bundle["default"], "predictions": predictions,
            "known_dataset_split": split,
            "note": "Experimental class scores, not clinical probabilities. No validated rejection of unrelated images."
                    + (f" This image is in the {split} set; it is not a new independent validation case." if split else "")}
