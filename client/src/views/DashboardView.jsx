import React from 'react';
import { Activity, Clock, Layers, AlertTriangle, ArrowRight, CheckCircle, Database, Sparkles } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import WarningAlert from '../components/WarningAlert';
import { MRI_SPECIMENS } from '../data/mriSpecimens';

export default function DashboardView({ activeSession, sessionHistory, onNavigate, onLoadSession }) {
  if (!activeSession) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 2rem' }}>
          <Activity size={40} style={{ color: '#2563eb', margin: '0 auto 1rem' }} />
          <h2>No Active MRI Analysis Session</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Upload an MRI slice or load one of the 10 curated benchmark specimens from the Colab research cohort to inspect the 10-stage classical pipeline.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            <button onClick={() => onNavigate('analyze')} className="btn btn-primary">
              <span>Go to Analyze & Upload</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} style={{ color: '#2563eb' }} />
              <span>Or select from the 10-specimen research cohort:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '6px' }}>
              {MRI_SPECIMENS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onNavigate('analyze')}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 6px',
                    fontSize: '11px',
                    textAlign: 'left'
                  }}
                  title={s.title}
                >
                  <img
                    src={s.thumbPath}
                    alt={s.title}
                    style={{ width: '22px', height: '22px', borderRadius: '2px', objectFit: 'contain', background: '#000' }}
                  />
                  <span>#{s.number} {s.sequence}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const m = activeSession.metrics || {};
  const dim = activeSession.dimensions || { width: 0, height: 0, channels: 1 };
  const bbox = m.roi_bbox || [0, 0, 0, 0];

  return (
    <div className="container-wide" style={{ padding: '2rem 1.5rem' }}>
      {/* Page Title & Status Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 style={{ margin: 0 }}>Workstation Dashboard</h2>
            <span className="badge badge-teal">{activeSession.sequence} Sequence</span>
            <span className="badge badge-blue">10/10 Stages Completed</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Specimen: <span className="mono" style={{ color: '#0f172a', fontWeight: 600 }}>{activeSession.filename}</span> | Resolution: <span className="mono">{dim.width}x{dim.height} px</span> | Runtime: <span className="mono">{activeSession.total_duration_ms} ms</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onNavigate('pipeline')} className="btn btn-secondary btn-sm">
            Inspect 10 Steps
          </button>
          <button onClick={() => onNavigate('segmentation')} className="btn btn-primary btn-sm">
            View Candidate ROI
          </button>
        </div>
      </div>

      {/* Warnings & Anomaly Guard Alerts */}
      <WarningAlert warnings={activeSession.warnings} />

      {/* Primary Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard
          label="Initial Spread"
          value={m.initial_std}
          unit="SD"
          baseline="~0.180"
          description="Pre-enhancement intensity standard deviation"
        />
        <MetricCard
          label="Enhanced Spread"
          value={m.stretched_std}
          unit="SD"
          baseline="~0.241 (+34%)"
          description="Post percentile stretching intensity dispersion"
        />
        <MetricCard
          label="Otsu Threshold"
          value={m.otsu_threshold}
          unit="gray levels"
          baseline="51 - 109 ref"
          description="Optimal threshold maximizing between-class variance"
        />
        <MetricCard
          label="Candidate ROI Area"
          value={m.roi_area_percent ? `${m.roi_area_percent.toFixed(2)}%` : '0%'}
          unit={`(${m.roi_area_pixels || 0} px)`}
          badge="Candidate ROI"
          description="Largest 8-connected component area"
        />
      </div>

      {/* Dual Panel: Candidate ROI Preview + Telemetry Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Candidate ROI Preview Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Candidate ROI Anatomical Overlay</span>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>
              BBox: [{bbox.join(', ')}]
            </span>
          </div>

          <div style={{ textAlign: 'center', backgroundColor: '#0a0d14', borderRadius: '4px', overflow: 'hidden' }}>
            {activeSession.step_images?.overlay_image ? (
              <img
                src={activeSession.step_images.overlay_image}
                alt="Candidate ROI"
                style={{ maxHeight: '340px', maxWidth: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ padding: '4rem 0', color: '#64748b' }}>No overlay generated</div>
            )}
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cyan: Candidate component contour</span>
            <span>Blue: Anatomical bounding box</span>
          </div>
        </div>

        {/* Execution Log & Telemetry */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Stage Execution Profile</span>
            <span className="badge badge-success">Deterministic</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
            <table className="scientific-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Operation</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(activeSession.steps_log || []).map((step, idx) => (
                  <tr key={idx}>
                    <td className="mono">{step.step}</td>
                    <td>{step.name}</td>
                    <td className="mono">{step.duration_ms} ms</td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{step.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Session History */}
      {sessionHistory && sessionHistory.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Database size={16} style={{ color: '#2563eb' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Analysis History (Current Session)</span>
          </div>
          <table className="scientific-table">
            <thead>
              <tr>
                <th>Specimen</th>
                <th>Sequence</th>
                <th>Dimensions</th>
                <th>Otsu Threshold</th>
                <th>ROI Area</th>
                <th>Warnings</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessionHistory.map((s, idx) => (
                <tr key={idx}>
                  <td className="mono" style={{ fontWeight: 500 }}>{s.filename}</td>
                  <td><span className="badge badge-blue">{s.sequence}</span></td>
                  <td className="mono">{s.dimensions?.width}x{s.dimensions?.height}</td>
                  <td className="mono">{s.metrics?.otsu_threshold}</td>
                  <td className="mono">{s.metrics?.roi_area_percent?.toFixed(2)}%</td>
                  <td>
                    {(s.warnings || []).length > 0 ? (
                      <span className="badge badge-warning">{(s.warnings || []).length} Alert(s)</span>
                    ) : (
                      <span className="badge badge-success">Clean</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => onLoadSession(s.sessionId)}
                      className="btn btn-secondary btn-sm"
                    >
                      Reload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
