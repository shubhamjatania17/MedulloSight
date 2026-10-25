import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export default function ImageViewer({ src, title = "Image View", maxHeight = "420px" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverPixel, setHoverPixel] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
  }, [src]);

  useEffect(() => {
    drawCanvas();
  }, [zoom, pan]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth || 384;
    canvas.height = img.naturalHeight || 384;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.imageSmoothingEnabled = false; // Preserve crisp pixel grid for scientific analysis
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Pixel Inspection
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Transform into original unzoomed image coordinates
    const origX = Math.round((canvasX - (canvas.width / 2 + pan.x)) / zoom + canvas.width / 2);
    const origY = Math.round((canvasY - (canvas.height / 2 + pan.y)) / zoom + canvas.height / 2);

    if (origX >= 0 && origX < canvas.width && origY >= 0 && origY < canvas.height) {
      const ctx = canvas.getContext('2d');
      try {
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
        const grayVal = Math.round(0.2989 * pixel[0] + 0.5870 * pixel[1] + 0.1140 * pixel[2]);
        setHoverPixel({ x: origX, y: origY, r: pixel[0], g: pixel[1], b: pixel[2], gray: grayVal });
      } catch (err) {
        // Cross-origin safety
      }
    } else {
      setHoverPixel(null);
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="card" style={{ padding: '0.75rem', position: 'relative' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.4rem'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
          {title}
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => setZoom(z => Math.min(z + 0.25, 4))}
            className="btn btn-secondary btn-sm"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
            className="btn btn-secondary btn-sm"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetView}
            className="btn btn-secondary btn-sm"
            title="Reset View"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsDragging(false); setHoverPixel(null); }}
        style={{
          width: '100%',
          height: maxHeight,
          overflow: 'hidden',
          backgroundColor: '#0a0d14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'crosshair',
          borderRadius: '4px',
          position: 'relative'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Pixel Inspector Telemetry Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.4rem',
          fontSize: '0.75rem',
          color: '#64748b',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
        <span>
          {hoverPixel
            ? `Cursor: [X:${hoverPixel.x}, Y:${hoverPixel.y}] | Intensity: ${hoverPixel.gray} (RGB: ${hoverPixel.r},${hoverPixel.g},${hoverPixel.b})`
            : "Hover to inspect pixel"}
        </span>
      </div>
    </div>
  );
}
