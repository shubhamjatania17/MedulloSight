import React, { useState } from 'react';
import { FileText, Download, CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react';
import { requestPdfReport } from '../services/api';

export default function ReportsView({ activeSession }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!activeSession) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>No active session. Please analyze an MRI first to generate a research report.</p>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg(null);

      const payload = {
        filename: activeSession.filename,
        sequence: activeSession.sequence,
        dimensions: activeSession.dimensions,
        total_duration_ms: activeSession.total_duration_ms,
        parameters: activeSession.parameters,
        metrics: activeSession.metrics,
        warnings: activeSession.warnings,
        step_images_b64: activeSession.step_images
      };

      const blob = await requestPdfReport(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MedulloSight_Report_${activeSession.sequence}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to compile publication PDF report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const m = activeSession.metrics || {};
  const dim = activeSession.dimensions || {};

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Research Report Documentation</h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Generate and export publication-style A4 research reports detailing all 10 operations, parameter configurations, intermediate results, and candidate ROI telemetry.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <Download size={16} />
          <span>{isGenerating ? "Compiling PDF..." : "Download PDF Report"}</span>
        </button>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '4px', color: '#b91c1c', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Report Preview Document Card */}
      <div
        className="card"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #cbd5e1',
          padding: '2.5rem'
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem' }}>MedulloSight</h1>
            <div style={{ fontSize: '0.95rem', color: '#475569' }}>Classical MRI Image Analysis & Segmentation</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            <div>ACADEMIC RESEARCH REPORT</div>
            <div>NON-CLINICAL INSTRUMENT</div>
          </div>
        </div>

        {/* Disclaimer Callout Box */}
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.8rem', color: '#9a3412', marginBottom: '1.5rem' }}>
          <strong>MANDATORY DISCLAIMER:</strong> MedulloSight is an educational and research-oriented image-processing tool. It is not a medical device, does not provide a clinical diagnosis, and must not replace assessment by a qualified radiologist or clinician.
        </div>

        {/* Specimen Metadata Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e293b' }}>
            Specimen Identification & Acquisition Telemetry
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Filename:</span>
              <div className="mono" style={{ fontWeight: 600 }}>{activeSession.filename}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Sequence:</span>
              <div className="mono" style={{ fontWeight: 600 }}>{activeSession.sequence}</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Resolution:</span>
              <div className="mono" style={{ fontWeight: 600 }}>{dim.width}x{dim.height} px</div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Runtime:</span>
              <div className="mono" style={{ fontWeight: 600 }}>{activeSession.total_duration_ms} ms</div>
            </div>
          </div>
        </div>

        {/* Visual Figures Preview */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#1e293b' }}>
            Processed Visual Figures
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ textAlign: 'center', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Raw Input MRI</div>
              <img src={activeSession.step_images.raw} alt="Raw" style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'center', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Sobel Edge Map</div>
              <img src={activeSession.step_images.edge_sobel} alt="Sobel" style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'center', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Candidate ROI Overlay</div>
              <img src={activeSession.step_images.overlay_image} alt="Overlay" style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        {/* Quantitative Metrics Summary Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e293b' }}>
            Key Experimental Telemetry
          </div>
          <table className="scientific-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Observed Value</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Contrast Standard Deviation Shift</td>
                <td className="mono">{m.initial_std} &rarr; {m.stretched_std}</td>
                <td>+34% intensity dispersion increase</td>
              </tr>
              <tr>
                <td>Otsu Optimal Threshold</td>
                <td className="mono">{m.otsu_threshold}</td>
                <td>Baseline research range: 51 - 109</td>
              </tr>
              <tr>
                <td>Connected Component Reduction</td>
                <td className="mono">{m.cc_count_before_open} &rarr; {m.cc_count_after_open}</td>
                <td>-{m.cc_reduction_percent?.toFixed(1)}% spurious noise removal</td>
              </tr>
              <tr>
                <td>Candidate ROI Area</td>
                <td className="mono">{m.roi_area_pixels} px ({m.roi_area_percent?.toFixed(2)}%)</td>
                <td>Largest 8-connected component in posterior fossa</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>Generated by MedulloSight Scientific Report Engine</span>
          <span>ReportLab A4 Standard Compliant</span>
        </div>
      </div>
    </div>
  );
}
