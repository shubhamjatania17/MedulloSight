# MedulloSight — Classical MRI Image Analysis & Segmentation

**MedulloSight** is an educational and research-oriented medical image processing platform based on a classical, training-free computer vision pipeline for enhancement, filtering, edge analysis, thresholding, morphological processing, and candidate region-of-interest (ROI) extraction in medulloblastoma MRI slices.

---

## 1. Important Medical & Educational Disclaimer

> **RESEARCH & EDUCATIONAL USE ONLY**  
> MedulloSight is an image-processing educational and research instrument. It is **not a medical device**, does **not provide a clinical diagnosis**, does **not confirm tumor presence**, and must **never replace assessment by a qualified radiologist or clinician**. The extracted region of interest is designated strictly as an algorithmic candidate region hypothesis, not a confirmed tumor segmentation.

---

## 2. The 10-Step Classical Pipeline Architecture

The pipeline operates in three distinct phases without neural networks or deep learning:

```text
[ Raw MRI Slice ]
       │
       ▼
[ Stage A: Spatial-Domain Enhancement ]
  1. Grayscale Conversion (ITU-R BT.601: Y = 0.2989R + 0.5870G + 0.1140B)
  2. Percentile Contrast Stretching (1st - 99th Percentile Normalization)
  3. Power-Law / Gamma Transformation (s = c * r^gamma, default gamma=0.5)
  4. Histogram Equalization (256 Discrete Intensity Levels)
  5. Median Filtering (3x3 Sliding Window Impulse Denoising)
       │
       ▼
[ Stage B: Frequency Domain & Boundary Analysis ]
  6. Frequency-Domain Butterworth Filtering (2D FFT LPF D0=50, HPF D0=30, n=2)
  7. Edge Detection Comparison Matrix (Sobel, Roberts, Prewitt, Laplacian; T = mu + 2*sigma)
       │
       ▼
[ Stage C: Segmentation, Morphology & Candidate ROI ]
  8. Otsu Global Thresholding (Maximizing Between-Class Variance; Ref: 51-109)
  9. Morphological Erosion & Dilation (Flat Disk Structuring Element r=3)
  10. Morphological Opening & Closing (Flat Disk r=7, 8-Connectivity)
  11. Candidate ROI Extraction & Anatomical Contour Overlay
```

---

## 3. Key Research Findings & Benchmarks

The classical algorithms implemented in MedulloSight reproduce the experimental findings documented in the research report:

| Metric / Operation | Research Baseline | Post-Operation Value | Impact / Measurement |
| :--- | :--- | :--- | :--- |
| **Contrast Stretching** | `0.180` Standard Dev | `0.241` Standard Dev | **+34%** Intensity dispersion increase across brain parenchyma |
| **Median Filtering (3x3)** | `16.84 dB` PSNR | `41.79 dB` PSNR | **+24.95 dB** Suppression of synthetic impulse/salt-and-pepper noise |
| **Butterworth LPF** | `24.41 dB` PSNR | `28.95 dB` PSNR | **+4.54 dB** Gaussian noise suppression without ringing ripple |
| **Morphological Opening** | `43.9` Components | `13.1` Components | **~70%** Reduction in spurious noise components |
| **Posterior Fossa Candidate** | Evaluated Cohort ($N=10$) | **8 / 10** Slices | Primary candidate enclosed the posterior fossa lesion |

---

## 4. System Architecture (MERN + Python Hybrid)

MedulloSight is implemented as a decoupled, multi-tier full-stack system:

1. **Frontend (`client/`)**: Modern React application built with Vite and pure Vanilla CSS. Features an interactive Canvas viewer with live pixel intensity inspection, side-by-side split wiper slider, and 10-step vertical inspector.
2. **API Gateway (`server/`)**: Node.js & Express server handling file ingestion (Multer), batch processing queues, CSV/ZIP packaging, and session persistence in MongoDB (with automatic in-memory fallback for zero-configuration local runs).
3. **Scientific Engine (`python_service/`)**: Python 3 + FastAPI microservice executing the 10-step pipeline (NumPy, OpenCV, SciPy, scikit-image), computing Shannon entropy, running T1 failure heuristic guards, and generating publication-grade A4 PDF reports via ReportLab.

---

## 5. Research Team

- **Team Member 1:** `[Mahirie Shah]` (`[I033]`)
- **Team Member 2:** `[Shubham Jatania]` (`[I034]`)
- **Team Member 3:** `[Krish Karanpuria]` (`[I035]`)

---

## 6. License & Citation

© 2026 MedulloSight. Classical MRI Image Analysis & Segmentation. Developed for educational, research, and reproducibility studies.
