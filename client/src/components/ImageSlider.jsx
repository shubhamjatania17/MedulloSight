import React, { useState, useRef } from 'react';

export default function ImageSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original / Pre",
  afterLabel = "Processed / Post",
  height = "380px"
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="card" style={{ padding: '0.75rem' }}>
      <div
        ref={containerRef}
        onMouseMove={(e) => { if (e.buttons === 1) handleMove(e.clientX); }}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative',
          width: '100%',
          height: height,
          overflow: 'hidden',
          backgroundColor: '#0a0d14',
          borderRadius: '4px',
          userSelect: 'none',
          cursor: 'ew-resize'
        }}
      >
        {/* After Image (Background Layer) */}
        <img
          src={afterSrc}
          alt={afterLabel}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />

        {/* Before Image (Clipped Foreground Layer) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${sliderPos}%`,
            height: '100%',
            overflow: 'hidden',
            borderRight: '2px solid #2563eb'
          }}
        >
          <img
            src={beforeSrc}
            alt={beforeLabel}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: containerRef.current ? containerRef.current.clientWidth : '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Split Divider Line & Handle */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPos}%`,
            width: '2px',
            backgroundColor: '#2563eb',
            transform: 'translateX(-50%)',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '24px',
              height: '24px',
              backgroundColor: '#1d4ed8',
              borderRadius: '50%',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 'bold'
            }}
          >
            &#8596;
          </div>
        </div>

        {/* Labels */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {beforeLabel}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {afterLabel}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
        Drag slider horizontally to compare spatial representations
      </div>
    </div>
  );
}
