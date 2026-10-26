import React, { useState } from 'react';
import { BarChart2, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { benchmarkImpulseNoise } from '../services/api';

export default function MetricsView({ activeSession }) {
  // Noise Demo State
  const [noiseDemoResult, setNoiseDemoResult] = useState(null);
  const [noiseDensity, setNoiseDensity] = useState(0.05);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  if (!activeSession) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p>No active session. Please analyze an MRI first.</p>
      </div>
    );
  }

  const m = activeSession.metrics || {};
  const initM = m.initial_metrics || {};
  const stretchM = m.stretched_metrics || {};
  const bbox = m.roi_bbox || [0, 0, 0, 0];
  const hist = activeSession.histogram_data?.raw || [];

  const runNoiseBenchmark = async () => {
    try {
      setIsBenchmarking(true);
      // Fetch current raw image as blob to send to benchmark endpoint
      const res = await fetch(activeSession.step_images.raw);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'benchmark.png');
      formData.append('density', noiseDensity.toString());

      const data = await benchmarkImpulseNoise(formData);
      setNoiseDemoResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="container-wide" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Scientific & Quantitative Metrics</h2>
        <p style={{ color: '#64748b' }}>
          Comprehensive statistical measurements of pixel intensity dispersion, spatial entropy, and morphological candidate region geometry.
        </p>
      </div>

      {/* Validation Policy Notice */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#334155' }}>
        <strong>Statistical Validation Policy:</strong> In strict accordance with responsible medical imaging standards, clinical segmentation metrics (Dice similarity coefficient, IoU, sensitivity, specificity) are <em>not calculated</em> because this study was conducted without certified radiologist manual ground-truth contours. Only reproducible classical computer-vision measurements are reported.
      </div>

      {/* Intensity Distribution Metrics Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            Intensity Dispersion Profile
          </div>
          <table className="scientific-table">
            <thead>
              <tr>
                <th>Statistical Metric</th>
                <th>Pre-Enhancement</th>
                <th>Post-Stretching</th>
                <th>Unit / Scale</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mean Intensity</td>
                <td className="mono">{initM.mean || m.initial_mean}</td>
                <td className="mono">{stretchM.mean || '--'}</td>
                <td>Gray level [0-255]</td>
              </tr>
              <tr>
                <td>Median Intensity</td>
                <td className="mono">{initM.median || '--'}</td>
                <td className="mono">{stretchM.median || '--'}</td>
                <td>Gray level [0-255]</td>
              </tr>
              <tr>
                <td>Standard Deviation</td>
                <td className="mono" style={{ fontWeight: 600 }}>{initM.std || m.initial_std}</td>
                <td className="mono" style={{ fontWeight: 600, color: '#059669' }}>{stretchM.std || m.stretched_std}</td>
                <td>Intensity Spread (+34% ref)</td>
              </tr>
              <tr>
                <td>Dynamic Range</td>
                <td className="mono">{initM.dynamic_range || '--'}</td>
                <td className="mono">{stretchM.dynamic_range || '--'}</td>
                <td>Max - Min span</td>
              </tr>
              <tr>
                <td>Shannon Entropy</td>
                <td className="mono" style={{ fontWeight: 600, color: '#2563eb' }}>{initM.entropy || m.entropy}</td>
                <td className="mono">{stretchM.entropy || '--'}</td>
                <td>bits (Information density)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Morphological & Bounding Box Telemetry */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
            Morphological & Geometric Telemetry
          </div>
          <table className="scientific-table">
            <thead>
              <tr>
                <th>Geometric Parameter</th>
                <th>Computed Value</th>
                <th>Scientific Rationale</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Optimal Otsu Threshold</td>
                <td className="mono" style={{ fontWeight: 600 }}>{m.otsu_threshold}</td>
                <td>Baseline research range: 51 - 109</td>
              </tr>
              <tr>
                <td>Foreground Pixel Share</td>
                <td className="mono">{m.foreground_percent?.toFixed(1)}%</td>
                <td>Fraction of slice above threshold</td>
              </tr>
              <tr>
                <td>Connected Components (Raw)</td>
                <td className="mono">{m.cc_count_before_open}</td>
                <td>Fragmented clusters post-Otsu</td>
              </tr>
              <tr>
                <td>Connected Components (Opened)</td>
                <td className="mono" style={{ color: '#059669', fontWeight: 600 }}>{m.cc_count_after_open}</td>
                <td>Disk radius 7 cleanup (-{m.cc_reduction_percent?.toFixed(1)}%)</td>
              </tr>
              <tr>
                <td>Candidate ROI Area</td>
                <td className="mono" style={{ fontWeight: 600 }}>{m.roi_area_pixels} px ({m.roi_area_percent?.toFixed(2)}%)</td>
                <td>Primary candidate posterior fossa component</td>
              </tr>
              <tr>
                <td>Bounding Box [Ymin, Xmin, Ymax, Xmax]</td>
                <td className="mono">[{bbox.join(', ')}]</td>
                <td>Spatial rectangular extent</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 256-Bin Histogram Visualization with Otsu Marker */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Intensity Frequency Histogram & Otsu Threshold Marker</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Red vertical line marks optimal threshold (T = {m.otsu_threshold}) maximizing between-class variance.
            </div>
          </div>
          <span className="mono" style={{ fontSize: '0.8rem', color: '#2563eb' }}>256 Intensity Bins</span>
        </div>

        {/* SVG Histogram Chart */}
        {hist.length > 0 ? (
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1rem' }}>
            <svg viewBox="0 0 512 160" style={{ width: '100%', height: '160px', display: 'block' }}>
              {(() => {
                const maxCount = Math.max(...hist, 1);
                return (
                  <>
                    {hist.map((count, i) => {
                      const barHeight = (count / maxCount) * 140;
                      return (
                        <rect
                          key={i}
                          x={i * 2}
                          y={150 - barHeight}
                          width={1.8}
                          height={barHeight}
                          fill="#94a3b8"
                        />
                      );
                    })}
                    {/* Otsu Threshold Line */}
                    <line
                      x1={m.otsu_threshold * 2}
                      y1={0}
                      x2={m.otsu_threshold * 2}
                      y2={150}
                      stroke="#dc2626"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                    <text
                      x={Math.min(m.otsu_threshold * 2 + 6, 440)}
                      y={20}
                      fill="#dc2626"
                      fontSize={11}
                      fontFamily="var(--font-mono)"
                      fontWeight="bold"
                    >
                      Otsu T = {m.otsu_threshold}
                    </text>
                  </>
                );
              })()}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              <span>0 (Dark / Background)</span>
              <span>128 (Mid-tone)</span>
              <span>255 (Bright / Fat / Contrast)</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No histogram data available.</div>
        )}
      </div>

      {/* Controlled Denoising Benchmarking Suite */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Controlled Median Filter Evaluation (Synthetic Noise Demonstration)</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Evaluates median 3x3 filter performance on synthetic salt-and-pepper noise against research paper benchmark (+25 dB PSNR).
            </div>
          </div>
          <button
            onClick={runNoiseBenchmark}
            disabled={isBenchmarking}
            className="btn btn-primary btn-sm"
          >
            {isBenchmarking ? "Benchmarking..." : "Run Noise Evaluation"}
          </button>
        </div>

        {noiseDemoResult && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Clean Reference</div>
                <img src={noiseDemoResult.clean_image} alt="Clean" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '4px' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
                  Noisy (d={noiseDemoResult.density}) | PSNR: {noiseDemoResult.noisy_metrics.psnr} dB
                </div>
                <img src={noiseDemoResult.noisy_image} alt="Noisy" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '4px' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', marginBottom: '0.25rem' }}>
                  Filtered (3x3) | PSNR: {noiseDemoResult.filtered_metrics.psnr} dB
                </div>
                <img src={noiseDemoResult.filtered_image} alt="Filtered" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.65rem 1rem', borderRadius: '4px', fontSize: '0.85rem', color: '#065f46' }}>
              <strong>Benchmark Finding:</strong> Median filtering yielded a <strong>+{noiseDemoResult.psnr_improvement_db} dB PSNR improvement</strong> (MSE reduced from {noiseDemoResult.noisy_metrics.mse} to {noiseDemoResult.filtered_metrics.mse}), validating the research paper observation (~+25 dB on synthetic noise).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
