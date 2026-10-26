import React, { useEffect, useRef, useState } from "react";
import { stagesFor } from "./processing";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export function Button({
  children,
  secondary = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`ms-button ${secondary ? "secondary" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Tag({ children, tone = "" }) {
  return <span className={`ms-tag ${tone}`}>{children}</span>;
}
export function SectionTitle({ eyebrow, title, children, action }) {
  return (
    <div className="section-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  );
}
export function Notice({ children, error = false }) {
  return (
    <div
      className={`ms-notice ${error ? "error" : ""}`}
      role={error ? "alert" : undefined}
    >
      {children}
    </div>
  );
}
export function Stat({ label, value, detail }) {
  return (
    <div className="ms-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export function Compare({
  before,
  after,
  beforeLabel = "Original",
  afterLabel = "Processed",
  compact = false,
}) {
  const [position, setPosition] = useState(50);
  return (
    <div className={`compare ${compact ? "compact" : ""}`}>
      <div className="compare-images">
        <img src={after} alt={afterLabel} />
        <img
          className="compare-before"
          src={before}
          alt={beforeLabel}
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        <div className="compare-line" style={{ left: `${position}%` }}>
          <span>↔</span>
        </div>
        <span className="image-label left">{beforeLabel}</span>
        <span className="image-label right">{afterLabel}</span>
      </div>
      <label className="compare-control">
        <span>Reveal the difference</span>
        <input
          aria-label="Original versus processed comparison"
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
        <span>{position}%</span>
      </label>
    </div>
  );
}

export function Viewer(props) {
  return <ImageViewer key={props.src} {...props} />;
}
function ImageViewer({ src, title = "MRI slice" }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [pixel, setPixel] = useState(null);
  const drag = useRef(null);
  const pixels = useRef(null);
  function loaded(event) {
    const image = event.currentTarget;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    try {
      pixels.current = {
        width: canvas.width,
        height: canvas.height,
        data: context.getImageData(0, 0, canvas.width, canvas.height).data,
      };
    } catch {
      pixels.current = null;
    }
  }
  function move(event) {
    if (drag.current) {
      setPan({
        x: drag.current.x + event.clientX - drag.current.startX,
        y: drag.current.y + event.clientY - drag.current.startY,
      });
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const p = pixels.current;
    if (!p) return;
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * p.width),
      y = Math.floor(((event.clientY - rect.top) / rect.height) * p.height);
    if (x >= 0 && y >= 0 && x < p.width && y < p.height) {
      const i = (y * p.width + x) * 4;
      setPixel({
        x,
        y,
        value: Math.round(
          0.299 * p.data[i] + 0.587 * p.data[i + 1] + 0.114 * p.data[i + 2],
        ),
      });
    }
  }
  return (
    <div className="viewer">
      <div className="viewer-toolbar">
        <span>{title}</span>
        <div>
          <button
            aria-label="Zoom out"
            onClick={() => setZoom((x) => Math.max(0.5, x - 0.25))}
          >
            <ZoomOut size={15} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            aria-label="Zoom in"
            onClick={() => setZoom((x) => Math.min(4, x + 0.25))}
          >
            <ZoomIn size={15} />
          </button>
          <button
            aria-label="Reset image view"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
      <div
        className="viewer-stage"
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <img
          src={src}
          alt={title}
          draggable="false"
          onLoad={loaded}
          style={{
            transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { startX: e.clientX, startY: e.clientY, ...pan };
          }}
          onPointerMove={move}
          onPointerUp={() => {
            drag.current = null;
          }}
        />
        <span className="viewer-readout">
          {pixel
            ? `X ${pixel.x} · Y ${pixel.y} · I ${pixel.value}`
            : "Drag to pan · Inspect a pixel · Zoom to explore"}
        </span>
      </div>
    </div>
  );
}

export function StagePlayer({ session, compact = false }) {
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false);
  const stages = stagesFor(session);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setStep((x) => (x + 1) % 11), 1400);
    return () => clearInterval(timer);
  }, [playing]);
  if (!session) return <div className="skeleton scan-skeleton" />;
  const stage = stages[step];
  return (
    <div className={`stage-player ${compact ? "compact" : ""}`}>
      <div className="stage-visual">
        <img src={session.step_images[stage[0]]} alt={stage[1]} />
        <span className="image-label left">{session.filename}</span>
        <span className="image-label right">
          {String(step).padStart(2, "0")} / 10
        </span>
        <div className="scan-crosshair" />
      </div>
      <div className="stage-controls">
        <button
          aria-label="Previous processing stage"
          onClick={() => setStep((x) => Math.max(0, x - 1))}
        >
          <ChevronLeft size={17} />
        </button>
        <button
          aria-label={
            playing
              ? "Pause processing walkthrough"
              : "Play processing walkthrough"
          }
          className="play-button"
          onClick={() => setPlaying((x) => !x)}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <input
          aria-label="Processing stage"
          type="range"
          min="0"
          max="10"
          value={step}
          onChange={(e) => {
            setStep(Number(e.target.value));
            setPlaying(false);
          }}
        />
        <button
          aria-label="Next processing stage"
          onClick={() => setStep((x) => Math.min(10, x + 1))}
        >
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="stage-caption">
        <span className="eyebrow">
          {step === 0 ? "The starting point" : `Operation ${step}`}
        </span>
        <h3>{stage[1]}</h3>
        <p>{stage[2]}</p>
        {!compact && <code>{stage[3]}</code>}
      </div>
    </div>
  );
}

export function Histogram({ data = [], threshold }) {
  const max = Math.max(1, ...data);
  return (
    <svg
      className="histogram"
      viewBox="0 0 512 150"
      role="img"
      aria-label="256-bin intensity histogram"
    >
      <path
        d={`M 0 140 ${data.map((v, i) => `L ${i * 2} ${140 - (v / max) * 125}`).join(" ")} L 512 140 Z`}
        fill="currentColor"
        opacity=".7"
      />
      {Number.isFinite(threshold) && (
        <line
          x1={threshold * 2}
          x2={threshold * 2}
          y1="5"
          y2="140"
          stroke="#e0a16b"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      )}
      <text x="0" y="150">
        0
      </text>
      <text x="480" y="150">
        255
      </text>
    </svg>
  );
}
export function LinkArrow({ children, onClick }) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowUpRight size={16} />
    </button>
  );
}
