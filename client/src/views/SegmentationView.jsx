import React, { useState } from 'react';
import { Layers, CheckCircle, AlertTriangle, Eye, Sliders } from 'lucide-react';
import ImageViewer from '../components/ImageViewer';
import WarningAlert from '../components/WarningAlert';

export default function SegmentationView({ activeSession }) {
  const [selectedOverlayMode, setSelectedOverlayMode] = useState('composite'); // 'composite' | 'candidate_mask' | 'opened_mask' | 'otsu_mask'

  if (!activeSession) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>No active session. Please analyze an MRI first.</p>
      </div>
    );
  }

  const imgs = activeSession.step_images || {};
  const m = activeSession.metrics || {};
  const bbox = m.roi_bbox || [0, 0, 0, 0];

  return (
    <div className="container-wide" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <h2 style={{ margin: 0 }}>Candidate ROI Extraction & Segmentation</h2>
          <span className="badge badge-teal">Candidate Region Only</span>
        </div>
        <p style={{ margin: 0, color: '#64748b' }}>
          Morphological isolation of connected components and candidate region extraction. This is an algorithmic candidate region, not a definitive clinical tumor boundary.
        </p>
      </div>

      <WarningAlert warnings={activeSession.warnings} />

      {/* Main Grid: Interactive Viewer + Inspection Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left: Canvas Viewer */}
        <div>
          <ImageViewer
            src={
              selectedOverlayMode === 'composite'
                ? imgs.overlay_image
                : (selectedOverlayMode === 'candidate_mask'
                    ? imgs.candidate_mask
                    : (selectedOverlayMode === 'opened_mask'
                        ? imgs.opened_mask
                        : imgs.otsu_mask))
            }
            title={
              selectedOverlayMode === 'composite'
                ? "Candidate ROI Anatomical Overlay (Cyan Boundary + Blue Bounding Box)"
                : (selectedOverlayMode === 'candidate_mask'
                    ? "Isolated Candidate 8-Connected Component Mask"
                    : (selectedOverlayMode === 'opened_mask'
                        ? "Morphologically Opened Binary Mask (Disk Radius 7)"
                        : "Raw Global Otsu Threshold Mask"))
            }
            maxHeight="480px"
          />

          {/* Layer Selector Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              onClick={() => setSelectedOverlayMode('composite')}
              className={`btn btn-sm ${selectedOverlayMode === 'composite' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Composite Overlay
            </button>
            <button
              onClick={() => setSelectedOverlayMode('candidate_mask')}
              className={`btn btn-sm ${selectedOverlayMode === 'candidate_mask' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Candidate Component
            </button>
            <button
              onClick={() => setSelectedOverlayMode('opened_mask')}
              className={`btn btn-sm ${selectedOverlayMode === 'opened_mask' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Cleaned Mask (Open/Close)
            </button>
            <button
              onClick={() => setSelectedOverlayMode('otsu_mask')}
              className={`btn btn-sm ${selectedOverlayMode === 'otsu_mask' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Raw Otsu Mask
            </button>
          </div>
        </div>

        {/* Right: Candidate Geometry & Measurements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Spatial Coordinates Card */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
              Candidate Region Spatial Telemetry
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Designation:</span>
                <span style={{ fontWeight: 600, color: '#0d9488' }}>Candidate ROI</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Candidate Area:</span>
                <span className="mono" style={{ fontWeight: 600 }}>
                  {m.roi_area_pixels || 0} pixels ({m.roi_area_percent?.toFixed(2) || 0}% of slice)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Bounding Box [Ymin, Xmin, Ymax, Xmax]:</span>
                <span className="mono" style={{ fontWeight: 600 }}>[{bbox.join(', ')}]</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Centroid Coordinates [Cy, Cx]:</span>
                <span className="mono" style={{ fontWeight: 600 }}>
                  [{m.centroid ? m.centroid.map(c => c.toFixed(1)).join(', ') : '0.0, 0.0'}]
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                <span style={{ color: '#64748b' }}>Component Reduction:</span>
                <span className="mono" style={{ fontWeight: 600, color: '#059669' }}>
                  {m.cc_count_before_open} &rarr; {m.cc_count_after_open} (-{m.cc_reduction_percent?.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Morphological Transformation Summary */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Morphological Extraction Rules
            </div>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              <li><strong>Otsu Global Thresholding:</strong> Separates foreground soft tissue from cranial bone/background.</li>
              <li><strong>Structuring Element (r=7):</strong> Disk-shaped mathematical element removes small satellite noise dots.</li>
              <li><strong>8-Connectivity Labeling:</strong> Groups contiguous pixels into independent candidate objects.</li>
              <li><strong>Component Selection:</strong> Largest 8-connected component is extracted as candidate ROI.</li>
            </ol>
          </div>

          {/* Scientific Disclaimer Note */}
          <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem', color: '#0f766e' }}>
            <strong>Scientific Note:</strong> The candidate bounding box and contour outline are mathematical approximations produced by training-free intensity and morphological operators. They must not be equated with definitive histology or clinician-contoured tumor margins.
          </div>
        </div>
      </div>
    </div>
  );
}
