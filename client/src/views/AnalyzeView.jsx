import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sliders, Play, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { analyzeSingleImage } from '../services/api';

export default function AnalyzeView({ onProcessingComplete, benchmarkSamples = [] }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sequence, setSequence] = useState('Unknown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [researchMode, setResearchMode] = useState(false);

  // Hyperparameters (Defaults matching research methodology)
  const [contrastLowP, setContrastLowP] = useState(1.0);
  const [contrastHighP, setContrastHighP] = useState(99.0);
  const [gamma, setGamma] = useState(0.5);
  const [butterworthD0, setButterworthD0] = useState(50.0);
  const [butterworthOrder, setButterworthOrder] = useState(2);
  const [medianKernel, setMedianKernel] = useState(3);
  const [morphRadiusSmall, setMorphRadiusSmall] = useState(3);
  const [morphRadiusLarge, setMorphRadiusLarge] = useState(7);

  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-detect suggested sequence based on filename if possible
    const name = file.name.toLowerCase();
    if (name.includes('t1c') || name.includes('t1_contrast')) {
      setSequence('T1C+');
    } else if (name.includes('t1')) {
      setSequence('T1');
    } else if (name.includes('t2')) {
      setSequence('T2');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleLoadSample = async (sample) => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl(sample.path);
      setSequence(sample.sequence);
    } catch (err) {
      setErrorMsg('Failed to load sample slice.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSequence('Unknown');
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecute = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select or upload an MRI slice before running analysis.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('sequence', sequence);
      formData.append('contrast_low_p', contrastLowP.toString());
      formData.append('contrast_high_p', contrastHighP.toString());
      formData.append('gamma', gamma.toString());
      formData.append('butterworth_d0', butterworthD0.toString());
      formData.append('butterworth_order', butterworthOrder.toString());
      formData.append('median_kernel', medianKernel.toString());
      formData.append('morph_radius_small', morphRadiusSmall.toString());
      formData.append('morph_radius_large', morphRadiusLarge.toString());

      const result = await analyzeSingleImage(formData);
      onProcessingComplete(result);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Image processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>MRI Analysis & Ingestion</h2>
        <p style={{ color: '#64748b' }}>
          Upload an axial MRI slice to execute the 10-operation classical pipeline, inspect intermediate representations, and extract candidate regions of interest.
        </p>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '6px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left Column: Upload Zone & Preview */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            1. Select or Upload MRI Image
          </div>

          {!previewUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '6px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transition: 'border-color 0.15s'
              }}
            >
              <UploadCloud size={36} style={{ color: '#2563eb', margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                Drag and drop MRI image here
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                or click to browse your local computer
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Supported: JPG, JPEG, PNG, TIFF, BMP, DICOM
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.tiff,.tif,.bmp,.dcm"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', backgroundColor: '#0a0d14', borderRadius: '4px', overflow: 'hidden', padding: '0.5rem' }}>
                <img
                  src={previewUrl}
                  alt="MRI Preview"
                  style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                <span className="mono" style={{ color: '#475569' }}>
                  {selectedFile ? selectedFile.name : 'Sample Loaded'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-sm">
                    Replace
                  </button>
                  <button onClick={resetForm} className="btn btn-secondary btn-sm">
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick-load Sample Benchmarks */}
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Or Load Curated Benchmark Specimens:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {benchmarkSamples.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSample(s)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  <ImageIcon size={12} />
                  <span>{s.sequence} Specimen</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Acquisition Metadata & Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Sequence Selection */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              2. Acquisition MRI Sequence
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Select acquisition sequence to configure heuristic failure checks (e.g. T1 subcutaneous scalp fat warning).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {['T1', 'T1C+', 'T2', 'Unknown'].map((seqOption) => (
                <label
                  key={seqOption}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    border: sequence === seqOption ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: sequence === seqOption ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: sequence === seqOption ? 600 : 400
                  }}
                >
                  <input
                    type="radio"
                    name="sequence"
                    value={seqOption}
                    checked={sequence === seqOption}
                    onChange={(e) => setSequence(e.target.value)}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <span>{seqOption}</span>
                </label>
              ))}
            </div>
            {sequence === 'Unknown' && (
              <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.5rem' }}>
                Note: Sequence-specific interpretation and T1 fat failure warnings will be deactivated.
              </div>
            )}
          </div>

          {/* Research Mode Hyperparameters */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Research Mode Parameters</div>
              <button
                onClick={() => setResearchMode(!researchMode)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                <Sliders size={12} />
                <span>{researchMode ? 'Hide Controls' : 'Show Advanced'}</span>
              </button>
            </div>

            {researchMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Contrast Stretch Percentiles (P1 - P99):</span>
                    <span className="mono">{contrastLowP}% - {contrastHighP}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={contrastLowP}
                    onChange={(e) => setContrastLowP(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Power-Law Gamma:</span>
                    <span className="mono">gamma = {gamma}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {[0.5, 1.0, 1.5].map((gVal) => (
                      <button
                        key={gVal}
                        onClick={() => setGamma(gVal)}
                        className={`btn btn-sm ${gamma === gVal ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, fontSize: '0.75rem' }}
                      >
                        {gVal} {gVal < 1 ? '(Brighten)' : (gVal > 1 ? '(Darken)' : '(Linear)')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Butterworth LPF Cutoff (D0):</span>
                    <span className="mono">D0 = {butterworthD0}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={butterworthD0}
                    onChange={(e) => setButterworthD0(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Default research values active (P1-P99 stretch, gamma=0.5, D0=50, 3x3 median, disk-7 opening).
              </div>
            )}
          </div>

          {/* Execution Button */}
          <button
            onClick={handleExecute}
            disabled={!selectedFile || isProcessing}
            className="btn btn-primary"
            style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 600 }}
          >
            {isProcessing ? (
              <span>Executing 10-Step Pipeline...</span>
            ) : (
              <>
                <Play size={18} />
                <span>Execute Classical Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
