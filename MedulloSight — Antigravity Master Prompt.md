# ANTIGRAVITY MASTER PROMPT
## Build MedulloSight — Classical MRI Image Analysis & Segmentation

You are an expert full-stack Python developer, medical-imaging software engineer, UI/UX designer, and scientific visualization engineer.

Build a complete, polished, production-quality Python web application called:

# MedulloSight

### Product descriptor
**Classical MRI Image Analysis & Segmentation**

### Product positioning
MedulloSight is an educational and research-oriented MRI image-processing platform based on a classical, training-free computer-vision pipeline for enhancement, edge detection, thresholding, morphological processing, and candidate region extraction in medulloblastoma MRI slices.

This is **not a clinical diagnostic system**.

The application must make the image-processing process transparent and inspectable rather than presenting a black-box prediction.

---

# 1. PRIMARY OBJECTIVE

Create the complete MedulloSight web application consisting of two major experiences:

1. **A polished public landing page**
2. **A functional MRI analysis web application**

The landing page introduces medulloblastoma, explains why MRI preprocessing matters, explains the MedulloSight methodology, presents the research findings and limitations, introduces the team, and directs users into the analysis application.

The main application allows users to upload MRI images and interactively execute, inspect, compare, measure, and export the classical image-processing pipeline described in the research report.

The final result should feel like a serious academic/medical-imaging research product.

It must NOT feel like a quickly generated AI dashboard.

---

# 2. CRITICAL DESIGN DIRECTIVE — NO "VIBECODED" UI

This requirement is extremely important.

The generated application must **not look AI-generated, template-generated, or "vibe coded."**

Do not use generic SaaS/dashboard design patterns simply because they are common in AI-generated interfaces.

## Explicitly avoid:

- Emojis anywhere in the interface
- Emoji-based feature icons
- Excessive rounded cards
- Giant pill-shaped buttons
- Glassmorphism
- Frosted glass panels
- Excessive transparency
- Heavy backdrop blur
- Floating translucent cards
- Neon gradients
- Purple/blue AI gradients
- Cyberpunk styling
- Excessive glow effects
- Dark writing on dark backgrounds
- Low-contrast text
- Decorative blobs
- Random floating shapes
- Excessive animated backgrounds
- Fake "AI" visual effects
- Unnecessary particle effects
- Generic chatbot-style interfaces
- Excessive shadows
- Excessive use of rounded containers
- Dashboard cards for every tiny piece of information
- Huge typography that wastes screen space
- Stock "AI medical" illustrations
- Generic doctor/brain/technology clip-art
- Fake accuracy percentages
- Fake clinical claims
- "Powered by AI" language
- Generic "Revolutionizing Healthcare" copy
- Artificial urgency
- Overuse of gradients
- Excessive animations
- Random icons from unrelated icon libraries
- Visual clutter

Do not make every section look like a floating card.

Do not make the entire page dark.

Do not use dark gray text on dark gray surfaces.

---

# 3. VISUAL DESIGN DIRECTION

The visual identity should feel closer to:

**medical research publication + scientific imaging workstation + modern academic software**

rather than:

**AI startup landing page + SaaS template + crypto dashboard.**

## Design characteristics

Use:

- Clean white and very light neutral surfaces
- Deep navy for strong headings and navigation
- Cool blue as the primary interaction color
- Restrained cyan/teal as an accent
- Soft medical green for positive/processed states
- Neutral gray for secondary information
- Amber/red only for warnings and limitations
- Strong visual hierarchy
- Generous but controlled whitespace
- Thin borders
- Subtle shadows
- Moderate corner radius
- High information density where appropriate
- Strong typography
- Scientific figure-style visualizations
- Clear labels
- Precise numerical presentation

The interface should feel engineered rather than decorated.

---

# 4. TYPOGRAPHY

Use a professional modern sans-serif such as:

- Inter
- Manrope
- DM Sans

Use typography deliberately.

Headings should be strong and readable.

Body text should prioritize readability.

Technical values, thresholds, image dimensions, processing times, and metrics may use a monospace font where appropriate.

Do not use oversized text everywhere.

Do not use excessively thin fonts.

Ensure sufficient contrast according to accessibility standards.

---

# 5. PRODUCT BRAND

Every major page should consistently use:

**MedulloSight**

Supporting descriptor:

**Classical MRI Image Analysis & Segmentation**

Suggested brand positioning:

> Making MRI image processing more transparent, one processing step at a time.

Do not call the system:

- MedulloSight AI
- MedulloSight Diagnostic AI
- MedulloSight Cancer Detector
- MedulloSight Tumor Detector

The product must not imply clinical diagnostic capability.

---

# 6. LANDING PAGE

Create a polished public-facing landing page.

Recommended navigation:

- Home
- Medical Context
- Pipeline
- Research
- Team
- Analyze MRI

The navigation should remain simple and professional.

---

# 7. LANDING PAGE — HERO

Create a strong hero section.

### Main headline

**Understanding Medulloblastoma Through MRI Image Processing**

### Supporting text

Explain that MedulloSight provides a transparent classical image-processing pipeline for improving MRI visibility, analyzing image structure, detecting edges, creating candidate masks, and extracting candidate regions of interest.

Do not describe the system as automatically diagnosing medulloblastoma.

### Primary CTA

**Analyze an MRI**

### Secondary CTA

**Explore the Pipeline**

### Hero visual

Create a sophisticated scientific MRI visualization.

Prefer:

- grayscale brain/MRI-style visual
- subtle anatomical contours
- edge overlays
- segmentation contours
- restrained scanning-line animation if technically appropriate

Do not use an actual identifiable patient's medical image as decorative hero artwork.

The visual should communicate:

**MRI → processing → candidate region**

without implying that the visual itself represents a confirmed diagnosis.

---

# 8. MEDICAL DISCLAIMER

Place a concise disclaimer near the hero and prominently within the application.

Use language similar to:

> MedulloSight is an educational and research-oriented image-processing tool. It is not a medical device, does not provide a clinical diagnosis, and should not replace assessment by a qualified radiologist or clinician.

Make the disclaimer visually noticeable without making the interface alarming.

---

# 9. MEDICAL CONTEXT SECTION

Create a section explaining medulloblastoma using information supported by the research report.

Include:

### What is Medulloblastoma?

Explain that medulloblastoma is a malignant brain tumour that commonly occurs in children.

### Typical Location

Explain that it commonly develops in the posterior fossa, particularly around the cerebellum and fourth ventricle.

### MRI

Explain that MRI is the main/recommended imaging modality discussed in the report.

### MRI appearance

Discuss the report's sequence-level observations:

- T1-weighted images: tumour is generally darker than surrounding cerebellar tissue.
- T1 contrast-enhanced images: solid tumour regions can appear bright after contrast.
- T2-weighted images: tumour is generally bright and may have heterogeneous appearance.

Do not turn these observations into deterministic diagnostic rules.

---

# 10. MOLECULAR GROUP INFORMATION

Include an educational section mentioning the four molecular groups described in the report:

- WNT-activated
- SHH-activated
- Group 3
- Group 4

Make it absolutely clear that:

**MedulloSight does not perform molecular classification.**

Do not imply that image processing determines molecular subgroup.

---

# 11. WHY MRI PROCESSING MATTERS

Explain the image-processing problem.

The report identifies challenges including:

- Low contrast
- Uneven brightness
- Noise
- Narrow intensity ranges
- Difficult tumour boundaries
- Scanner variation
- Sequence variation
- Patient variation

Explain that classical preprocessing can help make image structures more visible and provide intermediate representations that can be inspected directly.

---

# 12. MRI SEQUENCE SECTION

Create a clear three-column scientific explanation:

### T1
Structural MRI representation where the tumour can appear relatively darker.

### T1C+
Contrast-enhanced T1 images where enhancing solid tumour regions can become more conspicuous.

### T2
Tumour regions can appear relatively bright and heterogeneous.

Do not claim that every medulloblastoma follows these appearances.

---

# 13. PIPELINE EXPLANATION

Create a visual explanation of the complete MedulloSight pipeline.

The pipeline consists of **10 operations**:

1. Grayscale Conversion
2. Contrast Stretching
3. Power-Law / Gamma Transformation
4. Histogram Equalization
5. Median Filtering
6. Butterworth Filtering
7. Edge Detection
8. Otsu Thresholding
9. Erosion / Dilation
10. Opening / Closing

Visually divide these into three stages:

### Stage A — Spatial-Domain Enhancement

1. Grayscale
2. Contrast Stretching
3. Gamma Transformation
4. Histogram Equalization
5. Median Filtering

### Stage B — Frequency Domain & Edges

6. Butterworth Filtering
7. Edge Detection

### Stage C — Segmentation & Morphology

8. Otsu Thresholding
9. Erosion / Dilation
10. Opening / Closing

This organization follows the research methodology.

---

# 14. RESEARCH RESULTS SECTION

Create a research-results section using restrained scientific cards/figures.

Use the actual reported experimental findings:

### Contrast Stretching

Average standard deviation:

**0.180 → 0.241**

Approximately one-third increase in intensity spread.

### Median Filtering

Synthetic impulse-noise experiment:

**16.84 dB → 41.79 dB PSNR**

approximately **+25 dB**.

### Butterworth Low-Pass Filtering

Gaussian-noise experiment:

**24.41 dB → 28.95 dB PSNR**

approximately **+4.5 dB**.

### Morphological Opening

Average connected components:

**43.9 → 13.1**

approximately **70% reduction**.

### Candidate ROI

The final ROI contained the tumour-bearing posterior-fossa region in:

**8 / 10 tested slices**

These numbers are experimental results from the project's limited evaluation and must never be presented as clinical accuracy.

The report explicitly distinguishes these image-processing measurements from diagnostic/prognostic performance.

---

# 15. RESEARCH SHOWCASE

Create a visual sequence resembling a scientific paper figure:

**Original MRI**
→
**Grayscale**
→
**Enhanced**
→
**Denoised**
→
**Sobel Edge Map**
→
**Otsu Mask**
→
**Morphological Cleanup**
→
**Candidate ROI**

Each image should have a clear label.

Do not use excessive decoration around these images.

The image itself should be the focus.

---

# 16. LIMITATIONS SECTION

Create a serious "Limitations & Responsible Use" section.

Explicitly communicate:

- Only 10 2D MRI slices were evaluated.
- Images came from a public dataset.
- Images are JPEG-compressed.
- No expert ground-truth segmentation masks were used.
- Dice/IoU clinical segmentation validation was not performed.
- Artificial noise was used for some filtering experiments.
- Global thresholding has limitations.
- Performance can vary by MRI sequence.
- T1 images can produce difficult thresholding cases.
- The pipeline is not clinically validated.
- The extracted ROI is a candidate region, not a confirmed tumour segmentation.

The report specifically notes a T1 failure case where bright subcutaneous fat affected the global Otsu segmentation.

---

# 17. TEAM SECTION

Create a professional three-member team section.

Do NOT invent names or roll numbers.

Use configurable placeholders:

```python
TEAM_MEMBERS = [
    {
        "name": "[NAME]",
        "roll_no": "[ROLL NO.]",
        "photo": "assets/team/member1.jpg"
    },
    {
        "name": "[NAME]",
        "roll_no": "[ROLL NO.]",
        "photo": "assets/team/member2.jpg"
    },
    {
        "name": "[NAME]",
        "roll_no": "[ROLL NO.]",
        "photo": "assets/team/member3.jpg"
    }
]
```

Each profile should display:

- Photo
- Name
- Roll Number

Keep the design academic and restrained.

No exaggerated social-media-style profile cards.

---

# 18. LANDING PAGE CTA

End the landing page with:

### Ready to inspect an MRI?

Supporting text:

> Explore each stage of the MedulloSight processing pipeline and see how classical image-processing techniques transform an MRI slice into measurable intermediate representations and a candidate region of interest.

Button:

**Launch MedulloSight**

---

# 19. FOOTER

Create a minimal professional footer.

Left side:

**© 2026 MedulloSight**

Right side:

**Classical MRI Image Analysis & Segmentation**

Optional footer links:

- About
- Pipeline
- Research
- Responsible Use

Do not overload the footer.

---

# 20. MAIN APPLICATION

After clicking "Analyze an MRI", transition into the main MedulloSight application.

The main application should feel like a scientific imaging workstation.

Suggested application navigation:

- Dashboard
- Analyze
- Pipeline
- Segmentation
- Metrics
- Comparison
- Reports
- About

Avoid making every navigation item a giant rounded button.

---

# 21. DASHBOARD

Create an informative dashboard.

Display:

- Application title
- Current image
- Image dimensions
- Detected image format
- Selected MRI sequence
- Processing status
- Pipeline completion
- Candidate ROI status
- Key metrics
- Recent processing history for the current session

Use concise scientific terminology.

---

# 22. MRI UPLOAD

Support:

- JPG
- JPEG
- PNG
- TIFF
- BMP

Optionally support DICOM through `pydicom`.

For DICOM:

- Do not unnecessarily expose patient-identifying metadata.
- Do not permanently store patient information.
- Avoid showing unnecessary metadata fields.
- Provide safe handling of DICOM pixel data.

Upload interface should support:

- Drag and drop
- File picker
- Image preview
- Image reset
- Replace image

Show image dimensions and file type.

---

# 23. MRI SEQUENCE SELECTION

Allow the user to specify:

- T1
- T1C+
- T2
- Unknown / Other

Do not automatically pretend to determine the sequence if it cannot be reliably inferred.

If sequence is unknown, clearly state that sequence-specific interpretation may be less reliable.

---

# 24. CORE PIPELINE IMPLEMENTATION

Implement the actual processing pipeline in Python.

Use:

- Python 3.11+
- NumPy
- OpenCV
- SciPy
- scikit-image
- Pillow
- pandas
- matplotlib
- Plotly only where it genuinely improves interaction
- reportlab for PDF reports
- pydicom optionally for DICOM

Use modular architecture.

Do not place all processing logic inside `app.py`.

---

# 25. OPERATION 1 — GRAYSCALE

Implement:

```text
Y = 0.2989R + 0.5870G + 0.1140B
```

If the uploaded image is already grayscale, preserve it appropriately.

Display:

- Original
- Grayscale
- Histogram

Record image dimensions and intensity range.

---

# 26. OPERATION 2 — CONTRAST STRETCHING

Use the:

**1st–99th percentile**

range as described in the report.

Allow optional advanced configuration, but default to the research value.

Display:

- Before image
- After image
- Before histogram
- After histogram
- Min/max or percentile values
- Mean
- Standard deviation

---

# 27. OPERATION 3 — POWER-LAW TRANSFORMATION

Default:

```text
c = 1
```

Support:

```text
gamma = 0.5
gamma = 1.5
```

Explain:

- Gamma < 1 brightens darker regions.
- Gamma > 1 suppresses brighter intensities.

Show the transformation result and intensity statistics.

---

# 28. OPERATION 4 — HISTOGRAM EQUALIZATION

Use:

**256 intensity levels**

Display:

- Input
- Equalized image
- Input histogram
- Equalized histogram

Include a short explanation that histogram equalization may increase visible contrast while also increasing background noise.

---

# 29. OPERATION 5 — MEDIAN FILTER

Default:

**3 × 3 kernel**

Provide an optional research/demo mode that can introduce synthetic salt-and-pepper noise at:

**density = 0.05**

Use this only as a controlled demonstration.

Clearly label synthetic noise.

Never imply that the uploaded MRI naturally contains exactly this noise model.

Display:

- Original
- Noisy demonstration
- Filtered result
- PSNR when reference data is available
- MSE when appropriate

---

# 30. OPERATION 6 — BUTTERWORTH FILTERING

Implement frequency-domain Butterworth filtering.

Use:

### Low-pass

```text
D0 = 50
n = 2
```

### High-pass

```text
D0 = 30
n = 2
```

Use FFT-based processing.

Display:

- Frequency spectrum
- Filter response
- Filtered image
- Before/after comparison

Explain the purpose in simple technical language.

---

# 31. OPERATION 7 — EDGE DETECTION

Implement:

- Roberts
- Prewitt
- Sobel
- Laplacian

Display all four results in a scientific comparison grid.

Use the report's thresholding concept:

**μ + 2σ**

when generating thresholded edge-response representations.

Allow the user to select an edge operator.

Make Sobel the default comparison emphasis because it produced the most continuous/useful tumour and tissue boundaries in the report.

Do not claim that Sobel is universally superior.

---

# 32. OPERATION 8 — OTSU THRESHOLDING

Implement 256-bin Otsu thresholding.

Display:

- Otsu threshold value
- Binary mask
- Foreground percentage
- Histogram with threshold marker

Use the report's observed range as context:

**51–109 gray levels**

but calculate the threshold from the current image rather than hard-coding this range.

---

# 33. OPERATION 9 — EROSION / DILATION

Default:

**disk radius = 3**

Implement:

- Erosion
- Dilation

Display:

- Input mask
- Eroded mask
- Dilated mask
- Connected-component count before/after

---

# 34. OPERATION 10 — OPENING / CLOSING

Default:

**disk radius = 7**

Implement:

- Opening
- Closing

Use:

**8-connectivity**

for connected components.

Explain:

- Opening removes small isolated structures.
- Closing fills small gaps and connects nearby structures.

---

# 35. FINAL CANDIDATE ROI

After morphological processing:

1. Identify connected components.
2. Use the largest relevant 8-connected component.
3. Apply closing where appropriate.
4. Produce a candidate ROI.
5. Overlay the ROI on the original MRI.

Label it explicitly:

**Candidate ROI**

Never label it:

- Tumour confirmed
- Cancer detected
- Diagnosis
- Definitive tumour boundary

The correct terminology is:

> Candidate posterior-fossa ROI / segmentation candidate.

---

# 36. IMPORTANT T1 FAILURE HANDLING

Implement a warning system for cases where global Otsu thresholding behaves poorly.

Examples:

- Very small ROI
- Extremely large foreground region
- ROI touching image boundary
- Excessive connected components
- Nearly empty mask
- Nearly full-image mask
- Unusual Otsu threshold
- Bright fat/subcutaneous tissue dominating segmentation

For T1 images, display an additional warning when the segmentation may be influenced by bright fat or other non-tumour structures.

Do not silently present poor segmentation as a successful detection.

---

# 37. METRICS PAGE

Create a dedicated Metrics page.

Include:

### Intensity metrics

- Mean
- Median
- Standard deviation
- Minimum
- Maximum
- Entropy

### Filtering metrics

- MSE
- PSNR

Only show PSNR/MSE when a meaningful reference image exists.

### Segmentation metrics

- Otsu threshold
- Foreground percentage
- Connected-component count
- Largest component area
- ROI percentage
- ROI bounding box

Do NOT calculate Dice, IoU, sensitivity, specificity, or accuracy unless a genuine ground-truth mask has been supplied.

Do not invent ground truth.

---

# 38. COMPARISON PAGE

Create a visual comparison workspace.

Allow users to compare:

- Original
- Grayscale
- Contrast Stretching
- Gamma
- Histogram Equalization
- Median Filter
- Butterworth LPF
- Butterworth HPF
- Roberts
- Prewitt
- Sobel
- Laplacian
- Otsu
- Morphological result
- Final candidate ROI

Support:

- Side-by-side comparison
- Image slider where appropriate
- Zoom
- Pan
- Pixel inspection if practical

Keep the interface clean.

---

# 39. PIPELINE PAGE

Create a visual step-by-step pipeline inspector.

Each operation should show:

### Operation name

### Purpose

### Parameters

### Input image

### Output image

### Metrics

### Processing time

### Explanation

### Status

Use a vertical scientific workflow rather than a generic SaaS stepper.

The user should be able to understand exactly what happened to the image.

---

# 40. PROCESSING LOG

Provide a processing log.

Example:

```text
15:04:12  Image loaded
15:04:12  Converted to grayscale
15:04:12  Contrast stretching applied
15:04:12  Gamma transformation applied
15:04:13  Histogram equalization completed
15:04:13  Median filtering completed
15:04:13  Butterworth filtering completed
15:04:14  Edge detection completed
15:04:14  Otsu threshold calculated
15:04:14  Morphological processing completed
15:04:14  Candidate ROI extracted
```

Do not use emojis as status indicators.

Use restrained visual status markers such as:

- Completed
- Warning
- Failed
- Skipped

---

# 41. RESEARCH MODE

Include a "Research Mode."

This should expose more technical details.

Allow users to inspect:

- Every parameter
- Every intermediate image
- Histograms
- Frequency spectra
- Threshold values
- Connected components
- Processing times
- Statistical measurements

Advanced controls should be visually separated from the default workflow.

The default experience should remain approachable.

---

# 42. BATCH PROCESSING

Support optional batch processing.

Users should be able to upload multiple MRI images.

For each image:

- Run the same pipeline
- Record sequence if provided
- Calculate metrics
- Generate candidate ROI
- Save intermediate outputs
- Add results to a table

Provide:

- CSV export
- ZIP export of generated images
- Batch summary

Do not silently mix results from different parameter configurations.

---

# 43. REPORT GENERATION

Create a PDF research report.

Use `reportlab`.

Report should contain:

### Cover

MedulloSight

Classical MRI Image Analysis & Segmentation

### Image information

- Filename
- Dimensions
- Sequence
- Processing date/time

### Pipeline configuration

All 10 operations and parameters.

### Intermediate results

Selected pipeline images.

### Metrics

Tables and values.

### Candidate ROI

Original image with ROI overlay.

### Interpretation

Explain the processing results without claiming diagnosis.

### Limitations

Include the research limitations.

### Disclaimer

Research/educational use only.

---

# 44. ABOUT PAGE

Include:

### About MedulloSight

Explain the project motivation.

### Methodology

Explain the classical pipeline.

### Research basis

Explain that the implementation is based on the accompanying research work.

### Scope

Explain that it is intended for education, experimentation, and research.

### Responsible use

Repeat the medical disclaimer.

---

# 45. APPLICATION ARCHITECTURE

Use a modular structure similar to:

```text
medullosight/
│
├── app.py
├── config.py
├── requirements.txt
├── README.md
│
├── assets/
│   ├── logo/
│   ├── team/
│   └── illustrations/
│
├── pipeline/
│   ├── __init__.py
│   ├── grayscale.py
│   ├── enhancement.py
│   ├── gamma.py
│   ├── histogram.py
│   ├── denoising.py
│   ├── butterworth.py
│   ├── edges.py
│   ├── thresholding.py
│   ├── morphology.py
│   ├── roi.py
│   └── pipeline_runner.py
│
├── metrics/
│   ├── image_metrics.py
│   ├── segmentation_metrics.py
│   └── statistics.py
│
├── ui/
│   ├── landing.py
│   ├── dashboard.py
│   ├── pipeline_view.py
│   ├── segmentation_view.py
│   ├── metrics_view.py
│   ├── comparison_view.py
│   ├── reports_view.py
│   └── components.py
│
├── reports/
│   └── pdf_report.py
│
├── utils/
│   ├── image_io.py
│   ├── validation.py
│   ├── logging.py
│   └── session.py
│
└── tests/
    ├── test_grayscale.py
    ├── test_enhancement.py
    ├── test_filters.py
    ├── test_edges.py
    ├── test_thresholding.py
    ├── test_morphology.py
    └── test_pipeline.py
```

Keep computation separate from UI.

---

# 46. STATE MANAGEMENT

The application must preserve:

- Uploaded image
- Current sequence
- Pipeline parameters
- Intermediate outputs
- Metrics
- Candidate ROI
- Comparison selections

Use appropriate Streamlit session state or equivalent state management.

Do not rerun expensive processing unnecessarily.

Cache deterministic operations when appropriate.

---

# 47. SECURITY & PRIVACY

The application should process uploaded images locally where possible.

Do not send MRI images to external APIs.

Do not create unnecessary persistent storage.

Do not expose DICOM patient metadata unnecessarily.

Validate file types.

Handle corrupted images gracefully.

Limit excessively large uploads.

---

# 48. ERROR HANDLING

Never show raw Python tracebacks to normal users.

Create clear messages such as:

**Unable to process image**

Then explain the likely cause and provide a recovery action.

Examples:

- Unsupported image format
- Corrupt file
- Invalid dimensions
- Empty image
- Unsupported DICOM structure
- Processing failure
- Segmentation produced no meaningful component

Provide technical details in a developer/debug mode.

---

# 49. VISUALIZATION QUALITY

Scientific visualization is a major part of this application.

Use:

- Grayscale MRI views
- Intensity histograms
- Edge maps
- Binary masks
- Frequency-domain visualizations
- ROI overlays
- Connected-component visualizations
- Metric tables

Do not decorate scientific figures unnecessarily.

Figures should resemble figures from a serious research application or paper.

---

# 50. IMAGE DISPLAY REQUIREMENTS

MRI images must:

- Preserve aspect ratio
- Support zoom
- Support pan
- Avoid unnecessary interpolation artifacts
- Clearly indicate processing stage
- Provide image labels

When showing overlays, ensure the underlying MRI remains visible.

Use restrained colors for segmentation overlays.

Do not turn every image into a neon-colored heatmap.

---

# 51. RESPONSIVE DESIGN

The landing page must work across:

- Desktop
- Laptop
- Tablet
- Mobile

The actual MRI workstation may prioritize desktop because of the image-analysis workflow, but it should still remain usable on smaller screens.

Do not simply stack every desktop element vertically without reconsidering the information hierarchy.

---

# 52. ACCESSIBILITY

Ensure:

- Strong text contrast
- Visible focus states
- Keyboard-accessible controls
- Descriptive labels
- Meaningful alt text
- Do not rely on color alone for status
- Readable font sizes

Avoid light gray text that becomes difficult to read.

---

# 53. ANIMATION

Use animation sparingly.

Acceptable:

- Subtle page transitions
- Small hover transitions
- Image-processing progress
- Controlled scanning-line effect
- Gentle reveal animations

Avoid:

- Constant floating animations
- Bouncing cards
- Excessive parallax
- Animated gradients
- Particle backgrounds
- Attention-grabbing motion everywhere

The application should feel stable and precise.

---

# 54. ICONOGRAPHY

Use one consistent icon system if icons are required.

Do not use emojis.

Do not mix five different icon styles.

Icons should support comprehension, not decorate empty space.

Examples:

- Upload
- Image
- Filter
- Histogram
- Layers
- Report
- Settings
- Warning

Keep them subtle.

---

# 55. LANDING PAGE VISUAL HIERARCHY

The landing page should have clear editorial rhythm:

```text
NAVBAR

HERO
|
MEDICAL CONTEXT
|
WHY MRI PROCESSING MATTERS
|
THREE MRI SEQUENCES
|
10-STEP PIPELINE
|
PIPELINE VISUALIZATION
|
RESEARCH RESULTS
|
VISUAL RESEARCH SHOWCASE
|
LIMITATIONS / RESPONSIBLE USE
|
TEAM
|
CTA
|
FOOTER
```

Do not turn every section into a repeated card grid.

Use different visual compositions between sections.

---

# 56. COPYWRITING STYLE

Use concise, intelligent, research-oriented language.

Avoid:

> "Revolutionizing healthcare with cutting-edge AI."

Avoid:

> "Unlock the power of next-generation medical intelligence."

Avoid:

> "Our revolutionary AI detects brain tumors instantly."

Instead use:

> "A transparent classical image-processing pipeline for inspecting enhancement, filtering, edge structure, thresholding, and candidate ROI extraction."

The tone should be:

**scientific + confident + restrained + understandable**

---

# 57. MEDICAL CLAIMS POLICY

Never make unsupported claims.

MedulloSight must NOT say:

- "Detects cancer"
- "Diagnoses medulloblastoma"
- "Clinically accurate"
- "Radiologist replacement"
- "Medical-grade diagnosis"
- "Guaranteed tumour detection"
- "95% accurate"
- "AI diagnosis"

The final ROI must always be described as a:

**candidate ROI**

or

**segmentation candidate**

unless genuine external validation supports stronger terminology.

---

# 58. NO DEEP LEARNING

Do not introduce:

- CNNs
- Vision Transformers
- YOLO
- U-Net
- ResNet
- TensorFlow
- PyTorch

as part of the actual MedulloSight pipeline.

The research project is explicitly focused on a classical, training-free pipeline.

Future extensions may be mentioned conceptually, but they should not be implemented unless explicitly requested.

The report emphasizes that the proposed pipeline does not require training or specialized hardware.

---

# 59. QUALITY CONTROL

Before considering the application complete, verify:

### Landing page

- Looks professionally designed
- No emojis
- No glassmorphism
- No dark-on-dark text
- No generic AI styling
- Responsive
- Correct product name
- Correct medical messaging
- Three team placeholders
- Footer implemented

### Application

- Upload works
- Image preview works
- Pipeline works
- Every operation works
- Parameters are visible
- Intermediate images are available
- Metrics are calculated correctly
- Candidate ROI is generated
- Warnings work
- PDF report works
- CSV export works
- Batch processing works
- Errors are handled

---

# 60. TESTING

Create unit tests for the core image-processing functions.

Test:

- Grayscale conversion
- Percentile contrast stretching
- Gamma transform
- Histogram equalization
- Median filtering
- Butterworth filters
- Edge operators
- Otsu thresholding
- Erosion
- Dilation
- Opening
- Closing
- Connected components
- Candidate ROI extraction

Include edge cases:

- Empty image
- Uniform image
- Very dark image
- Very bright image
- Small image
- RGB image
- Grayscale image
- Noise-heavy image
- Segmentation with zero components
- Segmentation with extremely large foreground

---

# 61. README

Generate a professional README containing:

- Project overview
- MedulloSight description
- Features
- Pipeline architecture
- Installation
- Running locally
- Supported formats
- Parameter reference
- Metrics
- Research results
- Limitations
- Medical disclaimer
- Project structure
- Testing instructions

---

# 62. CONFIGURATION

Centralize configurable values.

For example:

```python
CONTRAST_LOW_PERCENTILE = 1
CONTRAST_HIGH_PERCENTILE = 99

GAMMA_VALUES = [0.5, 1.5]

HISTOGRAM_LEVELS = 256

MEDIAN_KERNEL_SIZE = 3
SYNTHETIC_NOISE_DENSITY = 0.05

BUTTERWORTH_LPF_D0 = 50
BUTTERWORTH_HPF_D0 = 30
BUTTERWORTH_ORDER = 2

MORPHOLOGY_DISK_RADIUS_SMALL = 3
MORPHOLOGY_DISK_RADIUS_LARGE = 7

CONNECTIVITY = 8
```

Do not scatter magic numbers throughout the application.

---

# 63. DEFAULT USER EXPERIENCE

A first-time user should be able to:

1. Open MedulloSight.
2. Understand what the product does within seconds.
3. Learn the basic medical context.
4. Understand the 10-step pipeline.
5. Click "Analyze an MRI."
6. Upload an image.
7. Select T1/T1C+/T2.
8. Run the pipeline.
9. Inspect every intermediate result.
10. View candidate ROI.
11. Review metrics.
12. Export a report.

There should be no confusing setup process.

---

# 64. FINAL UI PRINCIPLE

The central design philosophy is:

> **Show the work.**

Do not hide image processing behind a single "Analyze" button.

MedulloSight's value is that the user can see how:

**raw MRI**

becomes

**enhanced MRI**

then

**filtered representation**

then

**edge structure**

then

**binary mask**

then

**morphologically cleaned mask**

then

**candidate ROI**

Every transformation should be inspectable.

---

# 65. FINAL PRODUCT PERSONALITY

MedulloSight should feel:

- Precise
- Scientific
- Calm
- Academic
- Modern
- Trustworthy
- Transparent
- Technically sophisticated

It should NOT feel:

- Flashy
- AI-hyped
- Startup-buzzy
- Gamer-like
- Futuristic for the sake of being futuristic
- Template-generated
- "Vibe coded"

The user should look at the interface and think:

**"This is a serious medical-imaging research tool."**

not:

**"This is an AI-generated dashboard."**

---

# 66. IMPLEMENTATION PRIORITY

Build in this order:

### Phase 1
Project structure + dependencies + configuration.

### Phase 2
Core image-processing pipeline.

### Phase 3
Metrics and validation.

### Phase 4
Main MRI analysis application.

### Phase 5
Pipeline visualization and comparison tools.

### Phase 6
PDF/CSV/ZIP reporting.

### Phase 7
Landing page.

### Phase 8
Responsive design + accessibility.

### Phase 9
Testing.

### Phase 10
Final visual polish and removal of generic/vibe-coded design patterns.

Do not sacrifice functional correctness for visual effects.

---

# 67. FINAL ACCEPTANCE CRITERIA

The project is complete only when:

- MedulloSight is consistently branded everywhere.
- Landing page and main application are connected.
- The actual 10-operation classical pipeline works.
- Research parameters match the source methodology by default.
- Every intermediate stage can be inspected.
- Candidate ROI is clearly distinguished from diagnosis.
- Research results are presented accurately.
- Limitations are visible.
- Medical disclaimer is present.
- Three team placeholders are present.
- Footer contains copyright and product name.
- PDF reporting works.
- Metrics work.
- Batch processing works.
- Errors are handled gracefully.
- Core processing is tested.
- The UI is responsive.
- Accessibility is considered.
- There are no emojis.
- There is no glassmorphism.
- There are no neon AI gradients.
- There is no dark-on-dark typography.
- There are no fake AI/medical claims.
- There is no generic "vibe-coded" visual language.
- The application looks like a carefully designed scientific imaging product.

## MOST IMPORTANT FINAL INSTRUCTION

Do not merely generate something that technically works.

Build **MedulloSight as a coherent product**.

Every visual decision, interaction, label, metric, image, and piece of copy should reinforce the same idea:

> **A transparent, classical, research-oriented approach to MRI image processing for medulloblastoma analysis.**

The application should make the underlying image-processing methodology easier to understand, inspect, reproduce, and evaluate.

Prioritize correctness, scientific clarity, visual restraint, and professional craftsmanship over decorative UI trends.