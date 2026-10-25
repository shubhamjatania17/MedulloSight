import React from 'react';
import { Activity, Layers, Cpu, FileText, BarChart2, SplitSquareVertical, HelpCircle, Archive } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, hasActiveSession }) {
  const workstationTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analyze', label: 'Analyze', icon: Cpu },
    { id: 'pipeline', label: '10-Step Pipeline', icon: Layers },
    { id: 'segmentation', label: 'Candidate ROI', icon: Layers },
    { id: 'comparison', label: 'Comparison', icon: SplitSquareVertical },
    { id: 'metrics', label: 'Metrics', icon: BarChart2 },
    { id: 'batch', label: 'Batch Processing', icon: Archive },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'about', label: 'About', icon: HelpCircle }
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
        {/* Brand identity */}
        <div
          onClick={() => setCurrentView('landing')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#1d4ed8',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            M
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.1 }}>
              MedulloSight
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '-0.01em' }}>
              Classical MRI Image Analysis & Segmentation
            </div>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          <button
            onClick={() => setCurrentView('landing')}
            className={`btn btn-sm ${currentView === 'landing' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Overview & Context
          </button>

          <span style={{ color: '#cbd5e1', margin: '0 0.25rem' }}>|</span>

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
      </div>
    </header>
  );
}
