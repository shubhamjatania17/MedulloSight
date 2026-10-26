import React, { useState } from 'react';
import ImageSlider from '../components/ImageSlider';

export default function ComparisonView({ activeSession }) {
  const [beforeStageId, setBeforeStageId] = useState('raw');
  const [afterStageId, setAfterStageId] = useState('overlay_image');

  if (!activeSession) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>No active session. Please analyze an MRI first.</p>
      </div>
    );
  }

  const imgs = activeSession.step_images || {};

  const stages = [
    { id: 'raw', label: 'Raw MRI', src: imgs.raw },
    { id: 'grayscale', label: 'Grayscale', src: imgs.grayscale },
    { id: 'contrast_stretched', label: 'Contrast Stretched', src: imgs.contrast_stretched },
    { id: 'gamma', label: 'Gamma Transformed', src: imgs.gamma },
    { id: 'histogram_equalized', label: 'Histogram Equalized', src: imgs.histogram_equalized },
    { id: 'median', label: 'Median Denoised', src: imgs.median },
    { id: 'butterworth_lpf', label: 'Butterworth LPF', src: imgs.butterworth_lpf },
    { id: 'edge_sobel', label: 'Sobel Edges', src: imgs.edge_sobel },
    { id: 'otsu_mask', label: 'Otsu Mask', src: imgs.otsu_mask },
    { id: 'opened_mask', label: 'Morphological Opened', src: imgs.opened_mask },
    { id: 'overlay_image', label: 'Candidate ROI Overlay', src: imgs.overlay_image }
  ];

  const beforeStage = stages.find(s => s.id === beforeStageId) || stages[0];
  const afterStage = stages.find(s => s.id === afterStageId) || stages[stages.length - 1];

  return (
    <div className="container-wide" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Visual Comparison & Edge Operator Matrix</h2>
        <p style={{ color: '#64748b' }}>
          Interactively compare any two stages of the classical processing pipeline with a split-wiper slider and examine the four classical edge detection operators.
        </p>
      </div>

      {/* Comparison Wiper Studio */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Left (Before):</span>
            <select
              value={beforeStageId}
              onChange={(e) => setBeforeStageId(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Right (After):</span>
            <select
              value={afterStageId}
              onChange={(e) => setAfterStageId(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <ImageSlider
          beforeSrc={beforeStage.src}
          afterSrc={afterStage.src}
          beforeLabel={beforeStage.label}
          afterLabel={afterStage.label}
          height="450px"
        />
      </div>

      {/* 2x2 Edge Operator Matrix */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem' }}>Edge Detection Operator Comparison Matrix</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Thresholded boundary responses using the research formulation: T = mu + 2*sigma.
            </p>
          </div>
          <span className="badge badge-teal">Sobel Highlighted</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {/* Sobel (Primary) */}
          <div style={{ border: '2px solid #2563eb', borderRadius: '6px', padding: '0.5rem', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              <strong>Sobel (Default)</strong>
              <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Benchmark</span>
            </div>
            <div style={{ backgroundColor: '#0a0d14', borderRadius: '4px', overflow: 'hidden', textAlign: 'center' }}>
              <img src={imgs.edge_sobel} alt="Sobel" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Produces continuous boundary contours with reduced noise sensitivity.
            </div>
          </div>

          {/* Roberts */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              <strong>Roberts Cross</strong>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>2x2 Kernel</span>
            </div>
            <div style={{ backgroundColor: '#0a0d14', borderRadius: '4px', overflow: 'hidden', textAlign: 'center' }}>
              <img src={imgs.edge_roberts} alt="Roberts" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Diagonal difference operator; sensitive to high-frequency speckle.
            </div>
          </div>

          {/* Prewitt */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              <strong>Prewitt</strong>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>3x3 Kernel</span>
            </div>
            <div style={{ backgroundColor: '#0a0d14', borderRadius: '4px', overflow: 'hidden', textAlign: 'center' }}>
              <img src={imgs.edge_prewitt} alt="Prewitt" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Equal directional weighting; clean horizontal and vertical margins.
            </div>
          </div>

          {/* Laplacian */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              <strong>Laplacian</strong>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>2nd Derivative</span>
            </div>
            <div style={{ backgroundColor: '#0a0d14', borderRadius: '4px', overflow: 'hidden', textAlign: 'center' }}>
              <img src={imgs.edge_laplacian} alt="Laplacian" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Isotropic second-order operator highlighting rapid intensity transitions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
