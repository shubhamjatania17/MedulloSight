import React, { useState } from 'react';
import { Archive, Download, FileSpreadsheet, UploadCloud, CheckCircle, Sparkles } from 'lucide-react';
import { analyzeBatchImages, getBatchCsvUrl, getBatchZipUrl } from '../services/api';
import { MRI_SPECIMENS } from '../data/mriSpecimens';

export default function BatchView({ onSelectSession: _onSelectSession }) {
  const [batchFiles, setBatchFiles] = useState([]);
  const [sequence, setSequence] = useState('Unknown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFiles = (e) => {
    if (e.target.files) {
      setBatchFiles(Array.from(e.target.files));
      setErrorMsg(null);
    }
  };

  const handleLoadCohortBatch = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const files = await Promise.all(
        MRI_SPECIMENS.map(async (s) => {
          const res = await fetch(s.path);
          const blob = await res.blob();
          return new File([blob], s.filename, { type: 'image/jpeg' });
        })
      );
      setBatchFiles(files);
      setSequence('Mixed / Cohort');
    } catch (_err) {
      setErrorMsg('Failed to pre-load cohort batch slices.');
    } finally {
      setIsProcessing(false);
    }
  };

  const runBatchAnalysis = async () => {
    if (batchFiles.length === 0) {
      setErrorMsg('Please select multiple MRI images for batch evaluation.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const formData = new FormData();
      batchFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('sequence', sequence);

      const data = await analyzeBatchImages(formData);
      setBatchResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Batch analysis execution failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-wide" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Multi-Specimen Batch Processing Workspace</h2>
        <p style={{ color: '#64748b' }}>
          Execute the 10-operation classical pipeline in batch across multiple MRI slices. Generate comparative telemetry tables, export batch CSV records, and download bundled ZIP archives.
        </p>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '6px', color: '#b91c1c', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Batch Upload & Settings Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Select Batch Slices (Up to 20 images)
            </div>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.tiff,.tif,.bmp,.dcm"
              onChange={handleFiles}
              style={{ fontSize: '0.85rem' }}
            />
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleLoadCohortBatch}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                disabled={isProcessing}
              >
                <Sparkles size={12} style={{ color: '#2563eb' }} />
                <span>Load All 10 Cohort Slices (1-Click)</span>
              </button>
            </div>
            {batchFiles.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#059669', fontWeight: 500 }}>
                {batchFiles.length} slice(s) queued for execution.
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Common Acquisition Sequence
            </div>
            <select
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '100%', marginBottom: '0.75rem' }}
            >
              <option value="Unknown">Unknown / Mixed</option>
              <option value="T1">T1-Weighted</option>
              <option value="T1C+">T1 Contrast (T1C+)</option>
              <option value="T2">T2-Weighted</option>
            </select>

            <button
              onClick={runBatchAnalysis}
              disabled={batchFiles.length === 0 || isProcessing}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isProcessing ? "Processing Batch Pipeline..." : `Run Batch on ${batchFiles.length} File(s)`}
            </button>
          </div>
        </div>
      </div>

      {/* Batch Results Table & Exports */}
      {batchResult && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>Batch Execution Summary</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Batch ID: <span className="mono">{batchResult.batchId}</span> | Total: {batchResult.total_files} | Succeeded: {batchResult.successful} | Failed: {batchResult.failed}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a
                href={getBatchCsvUrl(batchResult.batchId)}
                className="btn btn-secondary btn-sm"
                download
              >
                <FileSpreadsheet size={14} />
                <span>Export CSV Metrics</span>
              </a>
              <a
                href={getBatchZipUrl(batchResult.batchId)}
                className="btn btn-primary btn-sm"
                download
              >
                <Download size={14} />
                <span>Download All Images (ZIP)</span>
              </a>
            </div>
          </div>

          <table className="scientific-table">
            <thead>
              <tr>
                <th>Slice Filename</th>
                <th>Status</th>
                <th>Dimensions</th>
                <th>Runtime</th>
                <th>Initial SD</th>
                <th>Enhanced SD</th>
                <th>Otsu T</th>
                <th>ROI Area</th>
                <th>Warnings</th>
              </tr>
            </thead>
            <tbody>
              {batchResult.results.map((res, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontWeight: 500 }}>{res.filename}</td>
                  <td>
                    {res.success ? (
                      <span className="badge badge-success">Success</span>
                    ) : (
                      <span className="badge badge-warning">Failed</span>
                    )}
                  </td>
                  <td className="mono">{res.dimensions ? `${res.dimensions.width}x${res.dimensions.height}` : '--'}</td>
                  <td className="mono">{res.total_duration_ms ? `${res.total_duration_ms} ms` : '--'}</td>
                  <td className="mono">{res.metrics?.initial_std ?? '--'}</td>
                  <td className="mono" style={{ color: '#059669' }}>{res.metrics?.stretched_std ?? '--'}</td>
                  <td className="mono">{res.metrics?.otsu_threshold ?? '--'}</td>
                  <td className="mono">{res.metrics?.roi_area_percent ? `${res.metrics.roi_area_percent.toFixed(2)}%` : '--'}</td>
                  <td>
                    {(res.warnings || []).length > 0 ? (
                      <span className="badge badge-warning">{(res.warnings || []).length} Alert(s)</span>
                    ) : (
                      <span className="badge badge-success">Clean</span>
                    )}
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
