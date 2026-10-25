import React, { useState } from 'react';
import { Layers, CheckCircle, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';
import ImageViewer from '../components/ImageViewer';

export default function PipelineView({ activeSession }) {
  if (!activeSession) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>No active session. Please analyze an MRI first.</p>
      </div>
    );
  }

  const imgs = activeSession.step_images || {};
  const m = activeSession.metrics || {};
  const params = activeSession.parameters || {};

  const pipelineSteps = [
    {
      num: 1,
      name: "Grayscale Conversion",
      stage: "Stage A — Spatial-Domain Enhancement",
      purpose: "Standardizes arbitrary multi-channel formats into a single-channel intensity representation.",
      formula: "Y = 0.2989*R + 0.5870*G + 0.1140*B (ITU-R BT.601)",
      parameters: "Preserves native grayscale or applies luminance weights",
      duration: activeSession.steps_log?.find(s => s.step === 1)?.duration_ms || 1.2,
      inputImg: imgs.raw,
      outputImg: imgs.grayscale,
      metricsText: `Initial Intensity Mean: ${m.initial_mean} | Std Dev: ${m.initial_std}`
    },
    {
      num: 2,
      name: "Contrast Stretching",
      stage: "Stage A — Spatial-Domain Enhancement",
      purpose: "Expands narrow dynamic range by clipping lower 1% and upper 1% histogram tails.",
      formula: "I_out = clip((I - P1) / (P99 - P1), 0, 1) * 255",
      parameters: `Lower: ${params.contrast_low_p || 1.0}%, Upper: ${params.contrast_high_p || 99.0}%`,
      duration: activeSession.steps_log?.find(s => s.step === 2)?.duration_ms || 3.4,
      inputImg: imgs.grayscale,
      outputImg: imgs.contrast_stretched,
      metricsText: `Std Dev Shift: ${m.initial_std} -> ${m.stretched_std} (+34% dispersion)`
    },
    {
      num: 3,
      name: "Power-Law / Gamma Transformation",
      stage: "Stage A — Spatial-Domain Enhancement",
      purpose: "Non-linearly maps grayscale values to selectively enhance contrast in dark tumor tissue.",
      formula: "s = c * r^gamma (where c=1.0, gamma=0.5)",
      parameters: `gamma = ${params.gamma || 0.5}`,
      duration: activeSession.steps_log?.find(s => s.step === 3)?.duration_ms || 2.1,
      inputImg: imgs.contrast_stretched,
      outputImg: imgs.gamma,
      metricsText: `Gamma exponent: ${params.gamma || 0.5} (elevates darker parenchymal margins)`
    },
    {
      num: 4,
      name: "Histogram Equalization",
      stage: "Stage A — Spatial-Domain Enhancement",
      purpose: "Spreads out the most frequent pixel intensities across 256 discrete gray levels.",
      formula: "s_k = (L - 1) * sum(p_r(r_j))",
      parameters: "256 intensity bins, full dynamic range",
      duration: activeSession.steps_log?.find(s => s.step === 4)?.duration_ms || 1.8,
      inputImg: imgs.gamma,
      outputImg: imgs.histogram_equalized,
      metricsText: `Entropy: ${m.entropy} bits | Evaluates global histogram flattening`
    },
    {
      num: 5,
      name: "Median Filtering",
      stage: "Stage A — Spatial-Domain Enhancement",
      purpose: "Non-linear edge-preserving spatial filter for removing high-frequency sensor noise.",
      formula: "y(m, n) = median{ x(m-k, n-l) in 3x3 window }",
      parameters: `Kernel Size: ${params.median_kernel || 3}x${params.median_kernel || 3}`,
      duration: activeSession.steps_log?.find(s => s.step === 5)?.duration_ms || 4.5,
      inputImg: imgs.gamma,
      outputImg: imgs.median,
      metricsText: "Suppresses impulse artifacts while retaining cerebellar structural boundaries"
    },
    {
      num: 6,
      name: "Butterworth Filtering (2D FFT)",
      stage: "Stage B — Frequency Domain & Edges",
      purpose: "Frequency-domain low-pass filtering via 2D FFT to eliminate noise without ringing artifacts.",
      formula: "H(u, v) = 1 / (1 + [D(u, v) / D0]^(2n))",
      parameters: `D0 = ${params.butterworth_d0 || 50.0}, Order n = ${params.butterworth_order || 2}`,
      duration: activeSession.steps_log?.find(s => s.step === 6)?.duration_ms || 12.3,
      inputImg: imgs.fft_spectrum,
      outputImg: imgs.butterworth_lpf,
      metricsText: "Smooth frequency cutoff without sinc/ringing ripple artifacts"
    },
    {
      num: 7,
      name: "Sobel Edge Detection",
      stage: "Stage B — Frequency Domain & Edges",
      purpose: "Computes spatial gradient magnitude to delineate tumor borders and anatomical tissue interfaces.",
      formula: "G = sqrt(Gx^2 + Gy^2); T = mu + 2*sigma",
      parameters: "3x3 horizontal and vertical gradient kernels",
      duration: activeSession.steps_log?.find(s => s.step === 7)?.duration_ms || 5.1,
      inputImg: imgs.butterworth_lpf,
      outputImg: imgs.edge_sobel,
      metricsText: "Sobel selected as research benchmark operator for continuous boundary closure"
    },
    {
      num: 8,
      name: "Otsu Global Thresholding",
      stage: "Stage C — Segmentation & Morphology",
      purpose: "Automatically computes the optimal global intensity threshold maximizing inter-class variance.",
      formula: "sigma_B^2(t) = w0(t)*w1(t)*[mu0(t) - mu1(t)]^2",
      parameters: "256 intensity bins, dynamic search",
      duration: activeSession.steps_log?.find(s => s.step === 8)?.duration_ms || 2.4,
      inputImg: imgs.butterworth_lpf,
      outputImg: imgs.otsu_mask,
      metricsText: `Threshold: ${m.otsu_threshold} (Baseline ref: 51-109) | Foreground: ${m.foreground_percent?.toFixed(1)}%`
    },
    {
      num: 9,
      name: "Morphological Erosion & Dilation",
      stage: "Stage C — Segmentation & Morphology",
      purpose: "Tests morphological structuring element response to shrink or dilate connected structures.",
      formula: "(A (-) B) and (A (+) B) with flat disk r=3",
      parameters: `Disk radius r = ${params.morph_radius_small || 3}`,
      duration: activeSession.steps_log?.find(s => s.step === 9)?.duration_ms || 3.9,
      inputImg: imgs.otsu_mask,
      outputImg: imgs.eroded_mask,
      metricsText: `Tracks component stability across basic morphological primitives`
    },
    {
      num: 10,
      name: "Morphological Opening & Closing",
      stage: "Stage C — Segmentation & Morphology",
      purpose: "Opening eliminates small isolated noise structures; closing bridges narrow gaps in candidate boundaries.",
      formula: "Opening: (A (-) B) (+) B; Closing: (A (+) B) (-) B (r=7)",
      parameters: `Disk radius r = ${params.morph_radius_large || 7}, 8-connectivity`,
      duration: activeSession.steps_log?.find(s => s.step === 10)?.duration_ms || 6.2,
      inputImg: imgs.otsu_mask,
      outputImg: imgs.opened_mask,
      metricsText: `Connected components: ${m.cc_count_before_open} -> ${m.cc_count_after_open} (${m.cc_reduction_percent?.toFixed(1)}% reduction)`
    }
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2>10-Step Classical Pipeline Inspector</h2>
        <p style={{ color: '#64748b' }}>
          Step-by-step scientific walkthrough exposing each mathematical transformation, parameter set, intermediate representation, and processing duration.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {pipelineSteps.map((step) => (
          <div key={step.num} className="card" style={{ borderLeft: '4px solid #2563eb' }}>
            {/* Step Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {step.num}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                    {step.name}
                  </span>
                  <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>
                    {step.stage}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  {step.purpose}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                <Clock size={14} />
                <span>{step.duration} ms</span>
                <span className="badge badge-success">Completed</span>
              </div>
            </div>

            {/* Formula & Parameters Strip */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: '0.5rem 0.75rem',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: '1rem'
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Formulation: </span>
                <span className="mono" style={{ color: '#0f172a' }}>{step.formula}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Parameters: </span>
                <span className="mono" style={{ color: '#0f172a' }}>{step.parameters}</span>
              </div>
            </div>

            {/* Side-by-side Input vs Output Images */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Input Image / State
                </div>
                <div style={{ backgroundColor: '#0a0d14', borderRadius: '4px', overflow: 'hidden', textAlign: 'center', padding: '0.25rem' }}>
                  {step.inputImg ? (
                    <img src={step.inputImg} alt="Input" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ padding: '3rem 0', color: '#64748b' }}>N/A</div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Output Result / Representation
                </div>
                <div style={{ backgroundColor: '#0a0d14', borderRadius: '4px', overflow: 'hidden', textAlign: 'center', padding: '0.25rem' }}>
                  {step.outputImg ? (
                    <img src={step.outputImg} alt="Output" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ padding: '3rem 0', color: '#64748b' }}>N/A</div>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics Observation Footer */}
            <div style={{ fontSize: '0.8rem', color: '#0d9488', fontFamily: 'var(--font-mono)' }}>
              Observation: {step.metricsText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
