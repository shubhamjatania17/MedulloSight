export function stagesFor(session) {
  const notebook = session?.pipeline_version !== "experimental-v2";
  return [
    [
      "raw",
      "Original MRI",
      "The supplied 2D image. This is the reference for visual comparison.",
      "Input",
    ],
    [
      "grayscale",
      "Grayscale",
      "Convert RGB intensities to one grayscale channel.",
      "0.2989R + 0.5870G + 0.1140B",
    ],
    [
      "contrast_stretched",
      "Contrast stretch",
      "Expand the selected intensity percentile range. The gain is measured for this image.",
      "clip((I − P_low) / (P_high − P_low))",
    ],
    [
      "gamma",
      "Gamma transform",
      notebook
        ? "A parallel enhancement experiment. In notebook mode this does not feed segmentation."
        : "Brighten or darken intensities before median filtering.",
      "s = r^γ",
    ],
    [
      "histogram_equalized",
      "Histogram equalization",
      "A parallel inspection branch, not an extra segmentation input.",
      "s = (L − 1) · CDF(r)",
    ],
    [
      "median",
      "Median filtering",
      notebook
        ? "Denoise the contrast-stretched image. This is the notebook-mode segmentation input."
        : "Denoise the gamma-transformed image.",
      "median(window)",
    ],
    [
      "butterworth_lpf",
      "Frequency filtering",
      notebook
        ? "An FFT exploration branch. Notebook mode thresholds the median image."
        : "The low-pass result is the experimental-mode segmentation input.",
      "H(D) = 1 / (1 + (D / D₀)²ⁿ)",
    ],
    [
      "edge_sobel",
      "Edge analysis",
      "Sobel gradients from the median image. Roberts, Prewitt and Laplacian are also computed.",
      "|G| = √(Gx² + Gy²)",
    ],
    [
      "otsu_mask",
      "Otsu threshold",
      "Separate image intensities into two groups. Bright foreground is not a tumour label.",
      "argmax σ²_between",
    ],
    [
      "opened_mask",
      "Morphological opening",
      "Remove small foreground structures with a disk-shaped element.",
      "A ○ B = (A ⊖ B) ⊕ B",
    ],
    [
      "overlay_image",
      "Candidate region",
      "Choose the largest opened component, then close that component. No anatomical or diagnostic confirmation is implied.",
      "opening → largest component → closing",
    ],
  ];
}

export function outputsFor(session) {
  const labels = new Map(stagesFor(session).map((item) => [item[0], item[1]]));
  const extra = {
    fft_spectrum: "FFT magnitude spectrum",
    butterworth_hpf: "High-pass magnitude",
    filter_response_lpf: "Low-pass filter response",
    edge_roberts: "Roberts edges",
    edge_prewitt: "Prewitt edges",
    edge_laplacian: "Laplacian response",
    edge_sobel_binary: "Thresholded Sobel edges",
    eroded_mask: "Eroded foreground",
    dilated_mask: "Dilated foreground",
    closed_mask: "Parallel closing of Otsu mask",
    candidate_mask: "Final candidate mask",
    ml_raw: "Fixed raw ML input",
    ml_sip: "Fixed SIP ML input",
  };
  return Object.keys(session.step_images).map((key) => [
    key,
    extra[key] || labels.get(key) || key,
  ]);
}
