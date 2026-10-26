import React from 'react';
import {
  Activity,
  Layers,
  Cpu,
  FileText,
  BarChart2,
  SplitSquareVertical,
  Archive,
  ArrowLeft
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onBackToLanding, activeSession }) {
  const workstationTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analyze', label: 'Analyze', icon: Cpu },
    { id: 'pipeline', label: '10-Step Pipeline', icon: Layers },
    { id: 'segmentation', label: 'Candidate ROI', icon: Layers },
    { id: 'comparison', label: 'Comparison', icon: SplitSquareVertical },
    { id: 'metrics', label: 'Metrics', icon: BarChart2 },
    { id: 'batch', label: 'Batch Processing', icon: Archive },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      <div
        className="container-wide"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Left Side: Return to Landing Portal + Workstation Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onBackToLanding();
            }}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 500,
              color: '#475569',
              padding: '0.35rem 0.75rem',
              textDecoration: 'none'
            }}
            title="Return to the interactive 3D MRI Archive"
          >
            <ArrowLeft size={14} />
            <span>3D Archive</span>
          </a>

          <div
            onClick={() => setCurrentView('dashboard')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                backgroundColor: '#1d4ed8',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              M
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: '600', fontSize: '1.12rem', color: '#0f172a', lineHeight: 1.1 }}>
                Medullo<span style={{ color: '#1d4ed8' }}>Sight</span> Workstation
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Interactive Analysis Studio
              </div>
            </div>
          </div>
        </div>

        {/* Center: Workstation Tab Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          {workstationTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.65rem'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Active Specimen Status Chip */}
        <div>
          {activeSession ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f0fdfa',
                border: '1px solid #99f6e4',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#0d9488'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#0d9488' }} />
              <span style={{ fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeSession.filename}
              </span>
              <span className="badge badge-teal" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>
                {activeSession.sequence}
              </span>
            </div>
          ) : (
            <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
              Ready for MRI
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
