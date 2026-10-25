import React from 'react';

export default function MetricCard({ label, value, unit = '', baseline = null, description = null, badge = null }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {label}
        </span>
        {badge && (
          <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.2rem 0' }}>
        <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {unit && (
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {baseline && (
        <div style={{ fontSize: '0.75rem', color: '#059669', fontFamily: 'var(--font-mono)' }}>
          Baseline: {baseline}
        </div>
      )}

      {description && (
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.3 }}>
          {description}
        </div>
      )}
    </div>
  );
}
