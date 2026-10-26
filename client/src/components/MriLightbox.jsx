import React, { useEffect, useRef } from 'react';
import { X, ArrowRight, Activity, Layers, Maximize2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Scientific FLIP Lightbox
 * Transitions smoothly from the source card's rect into a centered medical inspection modal.
 * Displays high-resolution MRI scan, sequence characteristics, SIP findings,
 * and direct "Analyze in Workstation" action.
 */
export default function MriLightbox({ specimen, sourceRect, onClose, onAnalyze, onNext, onPrev }) {
  const plateRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    const plate = plateRef.current;
    if (!plate || !sourceRect) return;

    // FLIP Animation: First -> Last -> Invert -> Play
    const plateRect = plate.getBoundingClientRect();
    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;
    const plateCenterX = plateRect.left + plateRect.width / 2;
    const plateCenterY = plateRect.top + plateRect.height / 2;

    const dx = sourceCenterX - plateCenterX;
    const dy = sourceCenterY - plateCenterY;
    const scale = Math.max(0.1, sourceRect.width / (plateRect.width || 600));

    plate.style.transition = 'none';
    plate.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    plate.style.opacity = '0.3';

    // Force browser layout reflow
    void plate.offsetHeight;

    // Animate to center
    plate.style.transition = 'transform 0.48s cubic-bezier(.22, .61, .36, 1), opacity 0.35s ease';
    plate.style.transform = 'none';
    plate.style.opacity = '1';
  }, [sourceRect, specimen]);

  if (!specimen) return null;

  return (
    <div
      className="lit-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="litTitle"
    >
      <div ref={plateRef} className="lit-plate">
        {/* Header Bar */}
        <div className="lit-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge ${specimen.sequence === 'T1' ? 'badge-blue' : (specimen.sequence === 'T1C+' ? 'badge-teal' : 'badge-purple')}`}>
                {specimen.sequence} Acquisition
              </span>
              <span className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
                Specimen #{specimen.number} · {specimen.filename}
              </span>
            </div>
            <h2 id="litTitle" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: '#f4f2ef', margin: 0 }}>
              {specimen.title}
            </h2>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              {specimen.place}
            </div>
          </div>

          <button
            onClick={onClose}
            className="lit-close-btn"
            aria-label="Close Inspector"
          >
            <X size={15} />
            <span>Close (Esc)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="lit-content-grid">
          {/* Left Column: High-Res Scan Display */}
          <div>
            <div className="lit-image-frame">
              <img
                src={specimen.path}
                alt={specimen.title}
                crossOrigin="anonymous"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
              <span className="mono">Matrix: {specimen.dimensions} · 8-bit Grayscale</span>
              <span className="mono">Colab SIP Cohort Specimen</span>
            </div>
          </div>

          {/* Right Column: Clinical/SIP Notes & Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Anatomical & Sequence Context
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#cbd5e1', margin: 0 }}>
                {specimen.note}
              </p>
            </div>

            {/* Benchmark Metrics Box */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Activity size={13} style={{ color: '#38bdf8' }} />
                <span>Cohort Benchmark Measurements</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Pre-Stretch Spread: </span>
                  <span className="mono" style={{ color: '#f4f2ef' }}>{specimen.metrics.initialStd} SD</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Post-Stretch Spread: </span>
                  <span className="mono" style={{ color: '#38bdf8' }}>{specimen.metrics.stretchedStd} SD</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Dispersion Gain: </span>
                  <span className="mono" style={{ color: '#10b981' }}>{specimen.metrics.dispersionGain}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Otsu Threshold: </span>
                  <span className="mono" style={{ color: '#f59e0b' }}>{specimen.metrics.otsuThreshold}</span>
                </div>
              </div>
            </div>

            {/* Non-Clinical Notice */}
            <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.45, padding: '8px 10px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '4px' }}>
              <strong>Notice:</strong> For educational & research inspection only. Candidate regions of interest represent mathematical hypotheses and must not be used for diagnosis.
            </div>

            {/* Primary Action Button: Launch Workstation with this specimen */}
            <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
              <button
                onClick={() => onAnalyze(specimen)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '10px 18px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  backgroundColor: '#1d4ed8',
                  borderRadius: '6px'
                }}
              >
                <span>Analyze Specimen #{specimen.number} in Workstation</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
