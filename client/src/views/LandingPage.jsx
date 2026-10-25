import React from 'react';
import { ArrowRight, CheckCircle, AlertCircle, FileText, ChevronRight, Layers, Sliders, Shield } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function LandingPage({ onLaunchWorkstation }) {
  const teamMembers = [
    { name: "Mahirie Shah", rollNo: "I033" },
    { name: "Shubham Jatania", rollNo: "I034" },
    { name: "Krish Karanpuria", rollNo: "I035" }
  ];



  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Hero Section */}
      <section
        style={{
          padding: '4.5rem 0 3.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
        }}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
              Training-Free Classical MRI Processing
            </div>
            
            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
              Understanding Medulloblastoma Through MRI Image Processing
            </h1>
            
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#475569', marginBottom: '2rem' }}>
              MedulloSight provides a transparent, training-free computer vision pipeline for improving MRI visibility, analyzing image frequency structure, detecting tissue edges, applying Otsu thresholding, and isolating candidate regions of interest in posterior fossa MRI slices.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={onLaunchWorkstation}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
              >
                <span>Analyze an MRI</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="#pipeline"
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
              >
                Explore the Pipeline
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '2rem', fontSize: '0.8rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} style={{ color: '#059669' }} />
                <span>Deterministic Algorithms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} style={{ color: '#059669' }} />
                <span>Fully Inspectable Steps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle size={15} style={{ color: '#059669' }} />
                <span>Non-Diagnostic Framework</span>
              </div>
            </div>
          </div>

          {/* Hero Visual: Scientific Brain Contour Visualization */}
          <div
            style={{
              backgroundColor: '#0a0d14',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              padding: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Scanning line animation */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                boxShadow: '0 0 8px #2563eb',
                animation: 'scanLine 3.5s linear infinite'
              }}
            />
            <style>{`
              @keyframes scanLine {
                0% { top: 0%; opacity: 0.8; }
                50% { top: 100%; opacity: 0.8; }
                100% { top: 0%; opacity: 0.8; }
              }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1rem', color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <span>SPECIMEN: AXIAL POSTERIOR FOSSA</span>
              <span>10-STAGE COMPUTATION</span>
            </div>

            {/* Simulated Anatomy SVG */}
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <svg width="280" height="280" viewBox="0 0 280 280" style={{ margin: '0 auto', display: 'block' }}>
                {/* Cranium outline */}
                <ellipse cx="140" cy="140" rx="110" ry="125" fill="#121826" stroke="#334155" strokeWidth="2" />
                {/* Subcutaneous fat rim */}
                <ellipse cx="140" cy="140" rx="104" ry="118" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* Brain parenchyma */}
                <ellipse cx="140" cy="140" rx="96" ry="108" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" opacity="0.8" />
                {/* Ventricles */}
                <path d="M 125,115 Q 120,135 128,150" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
                <path d="M 155,115 Q 160,135 152,150" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
                {/* Posterior fossa region */}
                <ellipse cx="140" cy="195" rx="48" ry="32" fill="#0f172a" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                {/* Candidate ROI contour in posterior fossa */}
                <circle cx="142" cy="198" r="18" fill="rgba(13, 148, 136, 0.3)" stroke="#0d9488" strokeWidth="2" />
                <rect x="120" y="176" width="44" height="44" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 3" />
                {/* Label pointer */}
                <line x1="164" y1="198" x2="215" y2="198" stroke="#0d9488" strokeWidth="1" />
                <text x="220" y="202" fill="#2dd4bf" fontSize="9" fontFamily="var(--font-mono)">Candidate ROI</text>
              </svg>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              <div>MODALITY: MRI</div>
              <div>CONNECTIVITY: 8-WAY</div>
              <div>CLASS: CLASSICAL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Context Section */}
      <section id="context" style={{ padding: '4.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ maxWidth: '780px', margin: '0 auto 3rem', textAlign: 'center' }}>
            <span className="badge badge-teal" style={{ marginBottom: '0.75rem' }}>Anatomical & Clinical Context</span>
            <h2>What is Medulloblastoma?</h2>
            <p style={{ fontSize: '1.05rem', color: '#475569' }}>
              Medulloblastoma is a fast-growing, highly malignant brain tumor that commonly develops in pediatric patients. It arises in the posterior fossa—specifically the cerebellum and surrounding the fourth ventricle—frequently compromising critical motor coordination and cerebrospinal fluid pathways.
            </p>
          </div>

          {/* MRI Sequence Trio */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card" style={{ borderTop: '4px solid #475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>T1-Weighted</span>
                <span className="badge badge-blue">Structural</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', minHeight: '60px' }}>
                On non-contrast T1 acquisitions, medulloblastoma typically appears relatively darker (hypointense) compared to adjacent cerebellar white matter.
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                <strong>Key Note:</strong> Bright scalp fat can impact global thresholding.
              </div>
            </div>

            <div className="card" style={{ borderTop: '4px solid #1d4ed8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>T1 Contrast (T1C+)</span>
                <span className="badge badge-teal">Enhanced</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', minHeight: '60px' }}>
                Following intravenous gadolinium injection, solid tumor components often demonstrate conspicuous enhancement, sharply delineating tumor tissue from brain parenchyma.
              </p>
              <div style={{ backgroundColor: '#f0fdfa', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: '#0d9488', border: '1px solid #ccfbf1' }}>
                <strong>Enhancement:</strong> Highlights vascularized solid mass.
              </div>
            </div>

            <div className="card" style={{ borderTop: '4px solid #0d9488' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>T2-Weighted</span>
                <span className="badge badge-blue">Fluid Sensitive</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475569', minHeight: '60px' }}>
                On T2 acquisitions, tumor tissue presents as relatively bright (hyperintense) and heterogeneous, often bordered by high-signal cerebrospinal fluid in the fourth ventricle.
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                <strong>Observation:</strong> Distinguishes edema and cysts.
              </div>
            </div>
          </div>

          {/* Molecular Group Explainer with Strict Disclaimer */}
          <div className="card" style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #2563eb' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Four Molecular Consensus Groups (Educational Reference)
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.75rem' }}>
              Current neuro-oncology classifies medulloblastoma into four distinct molecular subgroups based on genomic profiling:
              <strong> WNT-activated</strong>, <strong>SHH-activated</strong>, <strong>Group 3</strong>, and <strong>Group 4</strong>.
            </p>
            <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', color: '#1e40af', border: '1px solid #bfdbfe' }}>
              <strong>Important Notice:</strong> MedulloSight performs classical image processing only. It does <em>not</em> perform molecular classification or genomic subgrouping.
            </div>
          </div>
        </div>
      </section>

      {/* Why MRI Preprocessing Matters */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.75rem' }}>Scientific Rationale</span>
            <h2>Why Classical Preprocessing Matters</h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Raw MRI scans acquired directly from clinical scanners present multiple imaging artifacts that obscure anatomical tissue margins:
            </p>
            <ul style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: '1.25rem' }}>
              <li><strong>Narrow Dynamic Range:</strong> Intracranial soft tissues often cluster into a narrow grayscale intensity span.</li>
              <li><strong>Field Inhomogeneity:</strong> Radiofrequency coil profiles cause subtle low-frequency brightness variations across the field of view.</li>
              <li><strong>Acquisition Noise:</strong> Thermal and sensor fluctuations introduce high-frequency and impulse noise.</li>
              <li><strong>Scanner & Patient Variability:</strong> Magnet field strength (1.5T vs 3.0T) and sequence timings alter pixel statistics.</li>
            </ul>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '1rem' }}>
              Classical image-processing operations provide verifiable, transparent intermediate representations that reveal subtle structural variations without the opacity of black-box models.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1.8rem', color: '#1d4ed8', fontFamily: 'var(--font-mono)' }}>+34%</div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', margin: '0.25rem 0' }}>Intensity Dispersion</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Percentile contrast stretching (P1-P99) increases standard deviation from 0.180 to 0.241.</div>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1.8rem', color: '#0d9488', fontFamily: 'var(--font-mono)' }}>+25 dB</div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', margin: '0.25rem 0' }}>Impulse Denoising</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Median 3x3 filter elevates PSNR from 16.84 dB to 41.79 dB in synthetic noise evaluations.</div>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1.8rem', color: '#059669', fontFamily: 'var(--font-mono)' }}>-70%</div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', margin: '0.25rem 0' }}>Spurious Components</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Morphological opening reduces average connected components from 43.9 down to 13.1.</div>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '1.8rem', color: '#d97706', fontFamily: 'var(--font-mono)' }}>8 / 10</div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', margin: '0.25rem 0' }}>Posterior Fossa ROIs</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Candidate ROI successfully enclosed the lesion site across 8 of 10 evaluated cohort slices.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 10-Step Pipeline Overview */}
      <section id="pipeline" style={{ padding: '4.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ maxWidth: '750px', margin: '0 auto 3rem', textAlign: 'center' }}>
            <span className="badge badge-teal" style={{ marginBottom: '0.75rem' }}>Methodological Architecture</span>
            <h2>The 10-Step Classical Pipeline</h2>
            <p style={{ color: '#475569' }}>
              Divided strictly into three scientific phases according to spatial domain enhancement, frequency-domain filtering, and morphological segmentation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {/* Stage A */}
            <div className="card" style={{ borderTop: '4px solid #2563eb' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Stage A</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Spatial-Domain Enhancement</h3>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.8 }}>
                <li><strong>Grayscale Conversion:</strong> Luminance weighting (Y = 0.2989R + 0.5870G + 0.1140B).</li>
                <li><strong>Contrast Stretching:</strong> 1st to 99th percentile normalization.</li>
                <li><strong>Gamma Correction:</strong> Power-law transformation (s = c * r^gamma).</li>
                <li><strong>Histogram Equalization:</strong> 256 discrete gray level spreading.</li>
                <li><strong>Median Filtering:</strong> 3x3 spatial window for impulse suppression.</li>
              </ol>
            </div>

            {/* Stage B */}
            <div className="card" style={{ borderTop: '4px solid #0d9488' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Stage B</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Frequency Domain & Edges</h3>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.8 }} start={6}>
                <li><strong>Butterworth Filtering:</strong> 2D FFT low-pass (D0=50, n=2) and high-pass (D0=30, n=2).</li>
                <li><strong>Edge Detection Suite:</strong> Sobel, Roberts, Prewitt, and Laplacian with mu + 2*sigma thresholding.</li>
              </ol>
            </div>

            {/* Stage C */}
            <div className="card" style={{ borderTop: '4px solid #059669' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Stage C</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Segmentation & Morphology</h3>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.8 }} start={8}>
                <li><strong>Otsu Global Thresholding:</strong> Binarization maximizing between-class variance.</li>
                <li><strong>Erosion & Dilation:</strong> Structuring element with disk radius 3.</li>
                <li><strong>Opening & Closing:</strong> Structuring element with disk radius 7 (8-connectivity).</li>
                <li><strong>Candidate ROI:</strong> Largest 8-connected component & bounding box overlay.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations & Responsible Use */}
      <section id="limitations" style={{ padding: '4.5rem 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-warning" style={{ marginBottom: '0.75rem' }}>Academic Integrity</span>
            <h2>Limitations & Responsible Use</h2>
            <p style={{ color: '#475569' }}>
              The research project establishes clear boundaries regarding data, methodology, and clinical application.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="card">
              <h4 style={{ color: '#0f172a', marginBottom: '0.35rem' }}>Evaluation Cohort Size</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                The classical pipeline was evaluated on a small cohort of 10 two-dimensional MRI slices from a public dataset. Results reflect pilot feasibility rather than broad clinical statistical power.
              </p>
            </div>

            <div className="card">
              <h4 style={{ color: '#0f172a', marginBottom: '0.35rem' }}>Ground-Truth Absence</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                No manual ground-truth segmentation masks from certified neuroradiologists were available. Consequently, clinical Dice/IoU segmentation overlap metrics are not claimed or reported.
              </p>
            </div>

            <div className="card">
              <h4 style={{ color: '#0f172a', marginBottom: '0.35rem' }}>T1 Scalp Fat Interference</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                On non-contrast T1 acquisitions, bright subcutaneous scalp fat creates a dominant high-intensity mode in global Otsu histograms, which can misguide candidate extraction to the skull perimeter.
              </p>
            </div>

            <div className="card">
              <h4 style={{ color: '#0f172a', marginBottom: '0.35rem' }}>Candidate Region Designation</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                The extracted region is strictly a <em>candidate posterior-fossa segmentation region</em>, not a confirmed tumor boundary. It must never be interpreted as a diagnostic outcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" style={{ padding: '4.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-teal" style={{ marginBottom: '0.75rem' }}>Research Team</span>
            <h2>Project Contributors</h2>
            <p style={{ color: '#475569' }}>
              Academic development and research methodology contributors for the MedulloSight project.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {teamMembers.map((member, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '1.75rem 1rem' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    border: '2px solid #cbd5e1',
                    margin: '0 auto 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  {member.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  {member.rollNo}
                </div>
              </div>

            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>Ready to inspect an MRI?</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Explore each stage of the MedulloSight processing pipeline and see how classical image-processing techniques transform an MRI slice into measurable intermediate representations and a candidate region of interest.
          </p>
          <button
            onClick={onLaunchWorkstation}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', backgroundColor: '#2563eb' }}
          >
            <span>Launch MedulloSight Workstation</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 0', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '0.8rem', color: '#64748b' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>© 2026 MedulloSight</strong> — Classical MRI Image Analysis & Segmentation
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#context" style={{ color: '#64748b', textDecoration: 'none' }}>Medical Context</a>
            <a href="#pipeline" style={{ color: '#64748b', textDecoration: 'none' }}>10-Step Pipeline</a>
            <a href="#limitations" style={{ color: '#64748b', textDecoration: 'none' }}>Responsible Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
