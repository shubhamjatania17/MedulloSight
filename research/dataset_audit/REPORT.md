# MedulloSight dataset audit

Source: `C:\Users\ASUS\Downloads\archive (2).zip`.
This report describes the supplied files and folder labels; it does not independently verify clinical diagnoses or dataset provenance. No model has been trained and no application source files were changed during this audit.

## Verified contents

- 4,479 readable images; no decode failures.
- 44 folders: 14 disease categories across T1, T1C+, and T2, plus normal T1 and normal T2. These are not 44 tumour types.
- 4,478 JPEG-encoded files and one WebP file.
- 364 distinct image dimensions, ranging from 305 to 630 pixels in width and 347 to 630 pixels in height.
- No accompanying patient manifest, segmentation masks, bounding boxes, clinical metadata tables, or predefined training/test split.
- All ten original Colab examples have byte-identical matches in the archive; their source paths are recorded in `summary.json`.

## Labels and counts

The source spelling is retained in the manifest. Display names can be normalized separately without changing source provenance.

| Source category | Images | Unique decoded images within category |
|---|---:|---:|
| Astrocitoma | 580 | 570 |
| Carcinoma | 251 | 251 |
| Ependimoma | 150 | 150 |
| Ganglioglioma | 61 | 61 |
| Germinoma | 100 | 100 |
| Glioblastoma | 204 | 204 |
| Granuloma | 78 | 78 |
| Meduloblastoma | 131 | 131 |
| Meningioma | 874 | 850 |
| Neurocitoma | 457 | 457 |
| Oligodendroglioma | 224 | 209 |
| Papiloma | 237 | 237 |
| Schwannoma | 465 | 465 |
| Tuberculoma | 145 | 144 |
| _NORMAL | 522 | 522 |
| **Total** | **4,479** | **4,429** |

Medulloblastoma: **23 T1, 67 T1C+, 41 T2**. The astrocytoma label does not establish a particular subtype, anatomical location, or age group.

## Duplicate and leakage findings

- 36 groups of byte-identical pairs: 36 excess files.
- 50 groups of decoded-pixel-identical pairs: 50 excess images. This includes the byte-identical pairs; the counts must not be added together.
- No exact pixel-duplicate group crosses disease categories. Ten groups cross sequence folders, so the supplied sequence labels also require review.
- All 131 medulloblastoma images have distinct exact file and decoded-pixel hashes. This does not establish 131 distinct patients.
- After collapsing pixel-identical copies, a 64-bit DCT perceptual hash with Hamming distance at most 4 flags 4,746 potentially similar pairs, including 17 across disease categories. Forty-two pairs involve medulloblastoma; none of those 42 crosses a disease label.
- Perceptual similarity is a review signal, not proof of duplication, patient identity, or incorrect labelling. Adjacent slices and similar anatomy can produce close hashes. Conversely, crop changes and other alterations can escape this screen.

Preserve exact-copy groups and any verified related-case groups within a single split. Do not use a random file split followed by augmentation or deduplication. Resolve grouping and freeze splits before fitting preprocessing, feature selection, model parameters, calibration, or decision thresholds. Apply augmentation only to training data.

The ten previously explored notebook images should remain labelled demonstration/research-development cases. They should not become fresh, independent evidence of model generalization. Related images must also be considered when creating holdouts.

## Recommended research task

The main user-facing task can remain medulloblastoma-focused: **experimental medulloblastoma versus other supplied categories**, comparing models trained on original and classically preprocessed inputs using identical held-out cases.

There are 131 positive images and 4,348 other images before deduplication. Predicting "other" for every image already yields approximately **97.1% accuracy**. Overall accuracy alone would therefore be misleading. Report the confusion matrix, positive-class precision/recall/F1, balanced accuracy, and precision-recall AUC, alongside class counts and sequence breakdowns. Choose any decision threshold using validation data only.

A focused secondary experiment can compare medulloblastoma, ependymoma, and the dataset's broad astrocytoma category: 131, 150, and 570 unique decoded images respectively. These labels alone do not establish a matched posterior-fossa differential-diagnosis cohort. Review sample comparability before interpreting the result.

Start with an explainable image-feature baseline, then compare a lightweight transfer-learning model if the cleaned splits support it. Run raw-input and SIP-input experiments on the same splits. The present web pipeline and bundled notebook differ, so explicitly version the preprocessing rather than claiming exact reproduction.

Patient-level generalization remains unverified without trustworthy patient identifiers. Results from this dataset would be experimental image-level classification results. Folder labels do not supply tumour boundaries, so this archive alone cannot validate segmentation or generate ground-truth Dice/IoU scores.

## Implications for the app

- A cohort explorer can show the full medulloblastoma collection with verified image dimensions and sequence counts, while presenting other categories as comparison data.
- The case workspace can compare original and processed inputs and, once trained and evaluated, show experimental model outputs alongside measured processing results.
- The evaluation section should display held-out results, class balance, split methodology, and sequence-level results rather than hard-coded benchmark claims.
- Keep the classical candidate ROI separate from classification. Neither a class prediction nor a visualization of model attention verifies a tumour contour.
- The one WebP image decodes successfully in Python, but the existing Express upload filter does not explicitly support WebP. Dataset loading should either support that file or convert it reproducibly during preparation.

## Audit artifacts

- `audit_dataset.py`: repeatable read-only inspection of the ZIP; writes audit outputs only.
- `summary.json`: counts, exact duplicate groups, and links to the original notebook images.
- `manifest.jsonl`: per-file labels, dimensions, format, hashes, and decode status.
- `near_duplicate_candidates.json`: perceptual-similarity candidates for manual review.
- `sample_contact_sheet.jpg`: sampled images from medulloblastoma and comparison folders, labelled using the archive's folder labels.

Re-run from the application directory:

```powershell
.venv/Scripts/python.exe research/dataset_audit/audit_dataset.py 'C:\Users\ASUS\Downloads\archive (2).zip'
```
