# MedulloSight experimental model card

Artifact: `20261025T220420Z`. Preprocessing: `sip-ml-v1`.

Task: medulloblastoma versus the other supplied categories. A score is not a clinically validated probability. No patient-level validation has been established.

## Training and selection

Exact decoded pixels and pHash distance <=4 connected components; mixed-label components quarantined; original notebook groups excluded from training and evaluation.

Default model: `svm_sip`, selected on validation F1. The default was not changed after viewing the test set.

| Model | Validation F1 | Test F1 | Test precision | Test recall | PR AUC |
|---|---:|---:|---:|---:|---:|
| svm_raw | 0.905 | 0.930 | 0.952 | 0.909 | 0.932 |
| svm_sip | 0.930 | 0.900 | 1.000 | 0.818 | 0.917 |
| mobilenet_raw | 0.791 | 0.791 | 0.810 | 0.773 | 0.892 |
| mobilenet_sip | 0.653 | 0.600 | 0.536 | 0.682 | 0.627 |

The held-out test set contains 863 images, including only 22 medulloblastoma-labelled images. Raw-input SVM has higher test F1 than SIP-input SVM in this run; preprocessing does not universally improve classification. This is a single frozen split, not an independent patient cohort.

SVM: StandardScaler, balanced LinearSVC C=0.1, sigmoid calibration using three group-separated training folds. Transfer model: frozen ImageNet MobileNetV2 embeddings, balanced logistic-regression head C=0.1, no backbone fine-tuning. No augmentation. Threshold: maximum validation F1.

## Limitations

- Patient identities unavailable; similarity grouping does not establish patient independence.
- Dataset folder labels have not been independently clinically verified.
- No ground-truth tumour masks; classification does not validate the classical ROI.
- Image-level experimental results; no clinical validation or guaranteed rejection of unrelated images.

The original ten notebook images are demonstration cases excluded from fitting and evaluation. The classical ROI and ML classification are separate outputs; no ground-truth segmentation masks are supplied.

See `evaluation.json` for the confusion matrices, sequence results, curve points and model/split settings. See `splits.json` for per-file split provenance.
