import React, { useState } from 'react';
import { MRI_SPECIMENS } from '../data/mriSpecimens';
import { ArrowLeft } from 'lucide-react';

/**
 * Flat Scientific Grid Archive
 * Alternative 2D presentation for the 10 cohort MRI specimens with sequence filtering.
 */
export default function MriGrid({ isOpen, onCloseGrid, onSelectSpecimen }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filtered = MRI_SPECIMENS.filter((s) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'T1') return s.sequence === 'T1';
    if (activeFilter === 'T1C') return s.sequence === 'T1C+';
    if (activeFilter === 'T2') return s.sequence === 'T2';
    return true;
  });

  return (
    <div className={`mri-flat-grid ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onCloseGrid}
                className="btn btn-secondary btn-sm"
                style={{
                  color: '#f4f2ef',
                  borderColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.06)'
                }}
              >
                <ArrowLeft size={14} />
                <span>Return to 3D Sphere</span>
              </button>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: '#f4f2ef', margin: 0, fontSize: '1.4rem' }}>
                Cohort Specimen Archive
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
              10-specimen classical MRI evaluation cohort from Medulloblastoma_SIP_Colab.
            </p>
          </div>

          {/* Sequence Filter Tabs */}
          <div className="grid-filter-bar" style={{ margin: 0 }}>
            <button
              className={`filter-tab ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All Specimens (10)
            </button>
            <button
              className={`filter-tab ${activeFilter === 'T1' ? 'active' : ''}`}
              onClick={() => setActiveFilter('T1')}
            >
              T1 Structural (3)
            </button>
            <button
              className={`filter-tab ${activeFilter === 'T1C' ? 'active' : ''}`}
              onClick={() => setActiveFilter('T1C')}
            >
              T1C+ Contrast (4)
            </button>
            <button
              className={`filter-tab ${activeFilter === 'T2' ? 'active' : ''}`}
              onClick={() => setActiveFilter('T2')}
            >
              T2 Fluid-Sensitive (3)
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid-cards">
        {filtered.map((specimen) => (
          <div
            key={specimen.id}
            className="grid-card-item"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onSelectSpecimen(specimen, rect);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const rect = e.currentTarget.getBoundingClientRect();
                onSelectSpecimen(specimen, rect);
              }
            }}
          >
            <img
              src={specimen.thumbPath}
              alt={specimen.title}
              loading="lazy"
              crossOrigin="anonymous"
            />
            <div className="grid-card-overlay">
              <span className={`badge ${specimen.sequence === 'T1' ? 'badge-blue' : (specimen.sequence === 'T1C+' ? 'badge-teal' : 'badge-purple')}`} style={{ alignSelf: 'flex-start', marginBottom: '6px' }}>
                {specimen.sequence}
              </span>
              <div className="grid-card-title">{specimen.title}</div>
              <div className="grid-card-meta">{specimen.place}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
