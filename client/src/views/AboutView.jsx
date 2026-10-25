import React from 'react';
import { ShieldCheck, BookOpen, Layers, Users, AlertTriangle } from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AboutView() {
  const teamMembers = [
    { name: "Mahirie Shah", rollNo: "I033" },
    { name: "Shubham Jatania", rollNo: "I034" },
    { name: "Krish Karanpuria", rollNo: "I035" }
  ];


  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>About MedulloSight</h2>
        <p style={{ color: '#64748b' }}>
          Educational and scientific background, classical pipeline methodology, research scope, and team contributors.
        </p>
      </div>

      <DisclaimerBanner inline />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Project Motivation */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <BookOpen size={18} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Project Motivation & Scientific Scope</h3>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Medulloblastoma is the most common malignant pediatric brain tumor, originating in the posterior fossa near the cerebellum and fourth ventricle. Magnetic Resonance Imaging (MRI) is the primary non-invasive modality for clinical staging, but MRI scans exhibit narrow dynamic ranges, scanner variations, and field inhomogeneities.
          </p>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            MedulloSight was created to make image-processing transformations transparent, measurable, and inspectable. By breaking down enhancement, frequency-domain filtering, edge analysis, thresholding, and morphological operations into distinct steps, researchers and students can inspect how intermediate pixel transformations lead to candidate regions of interest.
          </p>
        </div>

        {/* Training-Free Classical CV Declaration */}
        <div className="card" style={{ borderLeft: '4px solid #0d9488' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Layers size={18} style={{ color: '#0d9488' }} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Training-Free Classical Approach (No Deep Learning)</h3>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            In contrast to deep-learning approaches (e.g. CNNs, U-Nets, or Vision Transformers) which operate as opaque black boxes requiring extensive labeled datasets and GPUs, MedulloSight relies entirely on deterministic classical computer vision algorithms: ITU-R BT.601 luminance weighting, percentile contrast stretching, 2D FFT Butterworth frequency filtering, spatial gradient convolution, global Otsu binarization, and morphological set operations.
          </p>
        </div>

        {/* Research Team Placeholders */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Users size={18} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Research & Engineering Team</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {teamMembers.map((m, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e2e8f0', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{m.rollNo}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Claims Policy */}
        <div className="card" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: '#d97706' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#92400e' }}>Strict Non-Clinical Claims Policy</h3>
          </div>
          <p style={{ color: '#92400e', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
            MedulloSight explicitly disclaims any clinical diagnostic capability. It does not detect cancer, diagnose medulloblastoma, or claim clinical sensitivity/specificity. All isolated regions are designated as candidate hypotheses for research and pedagogical inspection only.
          </p>
        </div>
      </div>
    </div>
  );
}
