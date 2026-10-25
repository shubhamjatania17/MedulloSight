import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function WarningAlert({ warnings = [] }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.75rem 0' }}>
      {warnings.map((w, idx) => {
        const isDanger = w.severity === 'danger' || w.code.includes('LIMITATION');
        const bgColor = isDanger ? '#fff7ed' : '#fffbeb';
        const borderColor = isDanger ? '#fdba74' : '#fde68a';
        const textColor = isDanger ? '#9a3412' : '#92400e';
        const iconColor = isDanger ? '#ea580c' : '#d97706';

        return (
          <div
            key={idx}
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              fontSize: '0.85rem',
              color: textColor
            }}
          >
            <AlertTriangle size={18} style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '2px' }}>
                {w.code.replace(/_/g, ' ')}
              </div>
              <div>{w.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
