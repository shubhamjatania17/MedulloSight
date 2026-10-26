import React, { useState, useEffect } from 'react';

/**
 * Cinematic Opening Splash / Intro (Phase 7)
 * A refined medical-imaging introduction featuring:
 * - Minimal project wordmark
 * - Thin loading progress indicator
 * - Subtle reveal of post-contrast specimen MB04_T1C with axial scan pulse
 * - Skip option and session-persistence
 */
export default function CinematicIntro({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [closing, setClosing] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    // Check if user has already seen the intro this session
    const seen = sessionStorage.getItem('medullosight_intro_seen');
    if (seen === 'true') {
      onComplete();
      return;
    }

    // Sequence timing
    const imgTimer = setTimeout(() => {
      setShowImage(true);
    }, 400);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 55);

    const finishTimer = setTimeout(() => {
      handleSkip();
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(imgTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  const handleSkip = () => {
    sessionStorage.setItem('medullosight_intro_seen', 'true');
    setClosing(true);
    setTimeout(() => {
      onComplete();
    }, 750);
  };

  return (
    <div
      className={`cin-splash ${closing ? 'out' : ''}`}
      role="dialog"
      aria-label="MedulloSight Introduction"
    >
      {/* Background Subtle Specimen Zoom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: showImage ? 0.22 : 0,
          transition: 'opacity 1.2s ease',
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        <img
          src="/mri/MB04_T1C.jpg"
          alt="Intro Scan"
          style={{
            width: 'min(70vh, 520px)',
            height: 'min(70vh, 520px)',
            objectFit: 'contain',
            filter: 'contrast(1.15) brightness(0.9)',
            transform: showImage ? 'scale(1.08)' : 'scale(1.0)',
            transition: 'transform 3.2s ease-out'
          }}
        />

        {/* Laser scan line sweep */}
        <div
          style={{
            position: 'absolute',
            width: 'min(70vh, 520px)',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, #38bdf8 50%, transparent 100%)',
            boxShadow: '0 0 12px #38bdf8',
            animation: 'laserScan 2.4s ease-in-out infinite'
          }}
        />
        <style>{`
          @keyframes laserScan {
            0% { transform: translateY(-180px); opacity: 0; }
            20% { opacity: 0.9; }
            80% { opacity: 0.9; }
            100% { transform: translateY(180px); opacity: 0; }
          }
        `}</style>
      </div>

      {/* Brand Wordmark */}
      <div className="brand-mark">
        Medullo<em>Sight</em>
      </div>

      {/* Progress Track */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Subtitle Tagline */}
      <div className="tagline">
        Classical MRI Image Analysis · 2026 Archive
      </div>

      {/* Skip Button */}
      <button onClick={handleSkip} className="skip-btn">
        Skip Intro
      </button>
    </div>
  );
}
