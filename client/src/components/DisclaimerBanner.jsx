import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner({ inline = false }) {
  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderLeft: '4px solid #d97706',
        borderRadius: inline ? '4px' : '0px',
        padding: '0.65rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        margin: inline ? '0.75rem 0' : '0',
        fontSize: '0.85rem',
        color: '#92400e'
      }}
    >
      <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
      <div>
        <strong>Research & Educational Disclaimer:</strong> MedulloSight is an educational and research-oriented image-processing tool. It is not a medical device, does not provide a clinical diagnosis, and should not replace assessment by a qualified radiologist or clinician.
      </div>
    </div>
  );
}
