import React, { useState } from 'react';
import { ArrowRight, Grid, Globe } from 'lucide-react';
import MriSphere from '../components/MriSphere';
import MriLightbox from '../components/MriLightbox';
import MriGrid from '../components/MriGrid';
import CustomCursor from '../components/CustomCursor';
import { MRI_SPECIMENS } from '../data/mriSpecimens';

export default function LandingPage({ onLaunchWorkstation }) {
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [sourceRect, setSourceRect] = useState(null);
  const [viewMode, setViewMode] = useState('sphere'); // 'sphere' | 'grid'

  const handleSelectSpecimen = (specimen, rect) => {
    setSelectedSpecimen(specimen);
    setSourceRect(rect);
  };

  const handleCloseLightbox = () => {
    setSelectedSpecimen(null);
    setSourceRect(null);
  };

  const handleAnalyzeSpecimen = (specimen) => {
    handleCloseLightbox();
    onLaunchWorkstation(specimen);
  };

  return (
    <div style={{ backgroundColor: '#030508', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Custom Inspect Cursor for Fine Pointers */}
      <CustomCursor />

      {/* Header */}
      <header
        style={{
          backgroundColor: '#030508',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.5rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#1d4ed8',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1.15rem',
                fontFamily: 'var(--font-mono)',
                boxShadow: '0 0 14px rgba(29, 78, 216, 0.5)'
              }}
            >
              M
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  color: '#f4f2ef',
                  lineHeight: 1.1,
                  letterSpacing: '0.01em'
                }}
              >
                Medullo<em style={{ fontStyle: 'normal', color: '#38bdf8', fontWeight: 300 }}>Sight</em>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Classical MRI Image Analysis &amp; Segmentation
              </div>
            </div>
          </div>

          {/* Primary Action: Launch Workstation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onLaunchWorkstation()}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: '#1d4ed8',
                borderRadius: '6px',
                boxShadow: '0 0 12px rgba(29, 78, 216, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Launch Workstation</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Interactive 3D MRI Sphere & Flat Grid */}
      <section
        id="archive-hero"
        style={{
          position: 'relative',
          backgroundColor: '#030508',
          flex: 1,
          minHeight: 'calc(100vh - 125px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 3D Fibonacci Sphere */}
        <MriSphere
          onSelectSpecimen={handleSelectSpecimen}
          isLitOpen={Boolean(selectedSpecimen)}
        />

        {/* View Mode Toggle Controls */}
        <div className="hero-controls">
          <button
            onClick={() => setViewMode(viewMode === 'sphere' ? 'grid' : 'sphere')}
            className={`hero-btn ${viewMode === 'grid' ? 'active' : ''}`}
            title="Toggle between 3D Sphere and 2D Flat Archive Grid"
          >
            {viewMode === 'sphere' ? (
              <>
                <Grid size={13} />
                <span>Flat Grid (10 Slices)</span>
              </>
            ) : (
              <>
                <Globe size={13} />
                <span>3D Sphere View</span>
              </>
            )}
          </button>
        </div>

        {/* Flat Grid Overlay */}
        <MriGrid
          isOpen={viewMode === 'grid'}
          onCloseGrid={() => setViewMode('sphere')}
          onSelectSpecimen={handleSelectSpecimen}
        />

        {/* Bottom Workstation Action Bar */}
        <div
          style={{
            marginTop: 'auto',
            backgroundColor: '#050810',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1rem 1.5rem',
            color: '#f4f2ef',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Select any specimen on the 3D sphere to inspect or launch analysis directly
            </div>

            <button
              onClick={() => onLaunchWorkstation()}
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: '#1d4ed8',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem'
              }}
            >
              <span>Open Workstation</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* FLIP Lightbox Modal */}
      {selectedSpecimen && (
        <MriLightbox
          specimen={selectedSpecimen}
          sourceRect={sourceRect}
          onClose={handleCloseLightbox}
          onAnalyze={handleAnalyzeSpecimen}
          onNext={() => {
            const idx = MRI_SPECIMENS.findIndex(s => s.id === selectedSpecimen.id);
            const nextIdx = (idx + 1) % MRI_SPECIMENS.length;
            setSelectedSpecimen(MRI_SPECIMENS[nextIdx]);
          }}
          onPrev={() => {
            const idx = MRI_SPECIMENS.findIndex(s => s.id === selectedSpecimen.id);
            const prevIdx = (idx - 1 + MRI_SPECIMENS.length) % MRI_SPECIMENS.length;
            setSelectedSpecimen(MRI_SPECIMENS[prevIdx]);
          }}
        />
      )}

      {/* Clean Minimal Footer */}
      <footer style={{ padding: '0.85rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#030508', fontSize: '0.8rem', color: '#64748b' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            &copy; 2026 MedulloSight &mdash; Classical MRI Image Analysis &amp; Segmentation
          </div>
          <div>
            <button
              onClick={() => onLaunchWorkstation()}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#38bdf8',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              Open Workstation &rarr;
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
