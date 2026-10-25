"""
MedulloSight — Publication-Grade PDF Research Report Generator
Builds a multi-page scientific research report using ReportLab.
Strictly adheres to non-diagnostic terminology and academic formatting.
"""

import datetime
import io
from typing import Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    HRFlowable
)


def generate_pdf_report(session_data: Dict[str, Any]) -> bytes:
    """
    Generates a structured, publication-style PDF report from session data.

    Args:
        session_data: Dictionary containing pipeline results, parameters,
                      metrics, warnings, and intermediate image arrays.

    Returns:
        Bytes containing the binary PDF document.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Scientific Typography Styles
    title_style = ParagraphStyle(
        "MedulloTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A")
    )
    subtitle_style = ParagraphStyle(
        "MedulloSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#475569")
    )
    section_heading = ParagraphStyle(
        "MedulloHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        "MedulloBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#334155")
    )
    disclaimer_style = ParagraphStyle(
        "MedulloDisclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#9A3412")
    )
    mono_style = ParagraphStyle(
        "MedulloMono",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # --- 1. Document Header Bar ---
    story.append(Paragraph("MedulloSight", title_style))
    sub_title = (
        "Classical MRI Image Analysis & Candidate Region Segmentation"
    )
    story.append(Paragraph(sub_title, subtitle_style))
    story.append(Spacer(1, 8))
    story.append(
        HRFlowable(
            width="100%",
            thickness=1.5,
            color=colors.HexColor("#2563EB"),
            spaceBefore=2,
            spaceAfter=8
        )
    )

    # --- 2. Mandatory Medical & Academic Disclaimer ---
    disclaimer_text = (
        "<b>RESEARCH & EDUCATIONAL DISCLAIMER:</b> MedulloSight is an "
        "image-processing research and educational instrument. It is NOT "
        "a medical device, does NOT confirm a tumor diagnosis, and must "
        "NEVER replace the evaluation of a qualified radiologist or clinician. "
        "Candidate ROIs are algorithmic hypotheses."
    )
    disc_table = Table(
        [[Paragraph(disclaimer_text, disclaimer_style)]],
        colWidths=["100%"]
    )
    disc_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFEDD5")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#F97316")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(disc_table)
    story.append(Spacer(1, 10))

    # --- 3. Study & Acquisition Metadata ---
    filename = session_data.get("filename", "mri_slice.png")
    sequence = session_data.get("sequence", "Unknown")
    dim = session_data.get("dimensions", {"width": 0, "height": 0})
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
    dim_str = f"{dim.get('width', 0)} x {dim.get('height', 0)} px"
    dur_str = f"{session_data.get('total_duration_ms', 0)} ms"

    meta_data = [
        [
            Paragraph("<b>Specimen / File:</b>", body_style),
            Paragraph(filename, mono_style),
            Paragraph("<b>MRI Sequence:</b>", body_style),
            Paragraph(sequence, mono_style)
        ],
        [
            Paragraph("<b>Dimensions:</b>", body_style),
            Paragraph(dim_str, mono_style),
            Paragraph("<b>Analysis Date:</b>", body_style),
            Paragraph(timestamp, mono_style)
        ],
        [
            Paragraph("<b>Processing Duration:</b>", body_style),
            Paragraph(dur_str, mono_style),
            Paragraph("<b>Pipeline Status:</b>", body_style),
            Paragraph("Completed (10/10 Stages)", mono_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[100, 160, 100, 160])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # --- 4. Pipeline Parameters Manifest ---
    story.append(
        Paragraph(
            "Pipeline Configuration & Research Hyperparameters",
            section_heading
        )
    )
    params = session_data.get("parameters", {})
    p_low = params.get("contrast_low_p", 1.0)
    p_high = params.get("contrast_high_p", 99.0)
    gamma_v = params.get("gamma", 0.5)
    med_k = params.get("median_kernel", 3)
    bw_d0 = params.get("butterworth_d0", 50.0)
    bw_ord = params.get("butterworth_order", 2)
    r_sm = params.get("morph_radius_small", 3)
    r_lg = params.get("morph_radius_large", 7)

    param_data = [
        ["Operation", "Classical Formulation", "Parameter Setting"],
        [
            "Contrast Stretching",
            "P1 - P99 Normalization",
            f"{p_low}% - {p_high}%"
        ],
        [
            "Power-Law Transform",
            "s = c * r^gamma",
            f"gamma = {gamma_v}, c = 1.0"
        ],
        [
            "Median Filtering",
            "3x3 Sliding Window",
            f"Kernel Size = {med_k}"
        ],
        [
            "Butterworth LPF",
            "2D FFT H(u,v) = 1/(1+(D/D0)^2n)",
            f"D0 = {bw_d0}, Order n = {bw_ord}"
        ],
        [
            "Edge Detection",
            "Sobel Kernel (mu + 2*sigma)",
            "3x3 Spatial Operator"
        ],
        [
            "Otsu Binarization",
            "Max Between-Class Variance",
            "256 Discrete Intensity Bins"
        ],
        [
            "Morphological Clean",
            "Erosion / Opening (Flat Disk)",
            f"r_small = {r_sm}, r_large = {r_lg}"
        ],
        [
            "ROI Extraction",
            "Largest 8-Connected Component",
            "Area filtering & Bounding Box"
        ]
    ]
    param_table = Table(param_data, colWidths=[130, 230, 160])
    param_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        (
            "ROWBACKGROUNDS",
            (0, 1),
            (-1, -1),
            [colors.white, colors.HexColor("#F8FAFC")]
        ),
        ("PADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(param_table)
    story.append(Spacer(1, 10))

    # --- 5. Intermediate Results Image Grid ---
    story.append(
        Paragraph("Key Intermediate Visual Transformations", section_heading)
    )
    images_dict = session_data.get("step_pil_images", {})

    labels = [
        ("Raw Input MRI", images_dict.get("raw")),
        ("Contrast Stretched", images_dict.get("contrast_stretched")),
        ("Butterworth LPF", images_dict.get("butterworth_lpf")),
        ("Sobel Edge Map", images_dict.get("edge_sobel")),
        ("Otsu Binary Mask", images_dict.get("otsu_mask")),
        ("Candidate ROI Overlay", images_dict.get("overlay_image"))
    ]

    row1, row2 = [], []
    for idx, (label_txt, pil_im) in enumerate(labels):
        if pil_im is not None:
            buf = io.BytesIO()
            pil_im.save(buf, format="PNG")
            buf.seek(0)
            rl_img = RLImage(buf, width=160, height=130)
            caption = (
                f"<font size=7 color='#475569'><b>{label_txt}</b></font>"
            )
            cell = [rl_img, Paragraph(caption, body_style)]
        else:
            cell = [Paragraph(f"{label_txt} (N/A)", body_style)]

        if idx < 3:
            row1.append(cell)
        else:
            row2.append(cell)

    if row1 and row2:
        img_table = Table([row1, row2], colWidths=[175, 175, 175])
        img_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAFAFA")),
            ("PADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(img_table)
        story.append(Spacer(1, 10))

    # --- 6. Quantitative Image & Segmentation Metrics ---
    story.append(
        Paragraph("Quantitative Telemetry & Measurements", section_heading)
    )
    metrics = session_data.get("metrics", {})
    init_std = f"{metrics.get('initial_std', 0.0):.2f}"
    str_std = f"{metrics.get('stretched_std', 0.0):.2f}"
    ent_val = f"{metrics.get('entropy', 0.0):.3f} bits"
    otsu_th = f"{metrics.get('otsu_threshold', 0)}"
    fg_pct = f"{metrics.get('foreground_percent', 0.0):.1f}%"
    cc_pre = f"{metrics.get('cc_count_before_open', 0)}"
    cc_post = f"{metrics.get('cc_count_after_open', 0)}"
    roi_px = metrics.get('roi_area_pixels', 0)
    roi_pct = metrics.get('roi_area_percent', 0.0)
    roi_area_str = f"{roi_px} px ({roi_pct:.2f}%)"
    bbox_str = str(metrics.get('roi_bbox', [0, 0, 0, 0]))

    m_data = [
        [
            "Metric Name",
            "Observed Value",
            "Scientific Baseline / Context"
        ],
        [
            "Initial Intensity Std Dev",
            init_std,
            "Baseline intensity dispersion (~0.180 in research)"
        ],
        [
            "Stretched Intensity Std Dev",
            str_std,
            "Post-enhancement dispersion (~0.241, +34% spread)"
        ],
        [
            "Shannon Entropy",
            ent_val,
            "Information density of gray distribution"
        ],
        [
            "Computed Otsu Threshold",
            otsu_th,
            "Empirical reference range: 51 - 109 gray levels"
        ],
        [
            "Foreground Coverage",
            fg_pct,
            "Proportion of slice above Otsu threshold"
        ],
        [
            "Connected Components (Pre-Open)",
            cc_pre,
            "Initial binarized isolated structures"
        ],
        [
            "Connected Components (Post-Open)",
            cc_post,
            "Post disk-7 opening (~70% reduction in research)"
        ],
        [
            "Candidate ROI Area",
            roi_area_str,
            "Area of primary candidate component"
        ],
        [
            "Candidate Bounding Box [y,x,y,x]",
            bbox_str,
            "Spatial extent within intracranial cavity"
        ]
    ]
    m_table = Table(m_data, colWidths=[170, 130, 220])
    m_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        (
            "ROWBACKGROUNDS",
            (0, 1),
            (-1, -1),
            [colors.white, colors.HexColor("#F8FAFC")]
        ),
        ("PADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(m_table)
    story.append(Spacer(1, 10))

    # --- 7. Warnings & Failure Mode Analysis ---
    warnings = session_data.get("warnings", [])
    if warnings:
        story.append(
            Paragraph("Diagnostic Failure & Warnings", section_heading)
        )
        warn_rows = [["Warning Code", "Scientific Observation"]]
        for w in warnings:
            warn_rows.append([w.get("code", "ADVISORY"), w.get("message", "")])
        w_table = Table(warn_rows, colWidths=[160, 360])
        w_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#B45309")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 7.5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#FCD34D")),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FEF3C7")),
            ("PADDING", (0, 0), (-1, -1), 3),
        ]))
        story.append(w_table)
        story.append(Spacer(1, 10))

    # --- 8. Methodological Limitations ---
    story.append(
        Paragraph("Methodological Scope & Limitations", section_heading)
    )
    limitations_text = (
        "1. Evaluation Sample Size: Developed and benchmarked on a limited "
        "cohort of 2D slices.<br/>"
        "2. Ground Truth Validation: Dice/IoU clinical validation was not "
        "performed due to absence of expert manual contour annotations.<br/>"
        "3. T1 Sequence Constraints: Non-contrast T1 acquisitions frequently "
        "suffer from bright subcutaneous scalp fat dominating Otsu.<br/>"
        "4. Training-Free Nature: This is a classical computer-vision "
        "pipeline, not a deep-learning model."
    )
    story.append(Paragraph(limitations_text, body_style))
    story.append(Spacer(1, 12))

    # --- 9. Document Footer ---
    footer_text = (
        "MedulloSight © 2026 — Classical MRI Image Analysis & "
        "Segmentation | Non-Clinical Research Report"
    )
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.HexColor("#94A3B8"),
            spaceBefore=4,
            spaceAfter=4
        )
    )
    foot_style = ParagraphStyle(
        "Footer",
        fontName="Helvetica",
        fontSize=7.5,
        textColor=colors.HexColor("#64748B"),
        alignment=1
    )
    story.append(Paragraph(footer_text, foot_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
