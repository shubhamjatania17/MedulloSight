import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MRI_SPECIMENS } from '../data/mriSpecimens';

/**
 * Fibonacci Sphere 3D Distribution for N=10 MRI Images
 * Centers headline and cards at the same 0x0 origin.
 * Depth-aware shading, inertia damping, touch/mouse axis discrimination,
 * and headline counter-rotation.
 */
export default function MriSphere({ onSelectSpecimen, isLitOpen }) {
  const stageRef = useRef(null);
  const worldRef = useRef(null);
  const orbRef = useRef(null);
  const headlineRef = useRef(null);
  const cardElementsRef = useRef([]);

  const [revealed, setRevealed] = useState(false);

  // Geometric calculations for 10 cards
  const cards = useMemo(() => {
    const N = MRI_SPECIMENS.length; // 10
    const GA = Math.PI * (3 - Math.sqrt(5)); // ~2.3999632 rad
    return MRI_SPECIMENS.map((specimen, i) => {
      const y = 1 - (i / (N - 1)) * 2; // from 1 down to -1
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * GA;
      const x = Math.cos(theta) * rad;
      const z = Math.sin(theta) * rad;
      const lat = Math.asin(y) * (180 / Math.PI);
      const lon = Math.atan2(x, z) * (180 / Math.PI);
      return {
        ...specimen,
        index: i,
        x,
        y,
        z,
        lat,
        lon
      };
    });
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const world = worldRef.current;
    const orb = orbRef.current;
    const headline = headlineRef.current;
    if (!stage || !world || !orb || !headline) return;

    // Trigger revealed entrance
    const revealTimer = setTimeout(() => {
      setRevealed(true);
    }, 200);

    // Physics & Camera State
    let spin = 0;
    let tilt = -4; // degrees
    let camZ = 0;
    let dragX = 0;
    let dragY = 0;
    let velX = 0;
    let velY = 0;
    let isDragging = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let isTouch = false;
    let touchDecided = false;
    let touchAllowed = false;
    let clickedCandidate = null;

    let R = 320;
    let cw = 140;
    let persp = 1150;
    let animId = null;

    // Resize / Dimension computation
    const updateDimensions = () => {
      const width = stage.clientWidth || window.innerWidth;
      const height = stage.clientHeight || 650;

      const hr = width <= 380 ? 0.38 : (width <= 640 ? 0.42 : 0.46);
      const wr = width <= 380 ? 0.48 : (width <= 640 ? 0.52 : 0.58);
      const floor = width <= 380 ? 110 : (width <= 640 ? 125 : 160);
      R = Math.max(floor, Math.min(460, height * hr, width * wr));

      const scale = width <= 380 ? 0.44 : (width <= 640 ? 0.46 : 0.48);
      cw = Math.round(Math.max(76, R * scale));

      persp = width <= 380 ? 620 : (width <= 640 ? 760 : (width <= 900 ? 920 : 1150));
      stage.style.setProperty('--persp', `${persp}px`);

      // Update card layouts
      cardElementsRef.current.forEach((el, idx) => {
        if (!el) return;
        const c = cards[idx];
        el.style.width = `${cw}px`;
        el.style.height = `${cw}px`;
        el.style.marginLeft = `${-cw / 2}px`;
        el.style.marginTop = `${-cw / 2}px`;
        el.style.transform = `translate3d(${c.x * R}px, ${-c.y * R}px, ${c.z * R}px) rotateY(${c.lon}deg) rotateX(${c.lat}deg)`;
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Image load fade-in
    cardElementsRef.current.forEach((el) => {
      if (!el) return;
      const img = el.querySelector('img');
      if (img) {
        if (img.complete) {
          img.classList.add('in');
        } else {
          img.onload = () => img.classList.add('in');
        }
      }
    });

    // Camera Render Loop
    const render = () => {
      if (!isDragging && !isLitOpen) {
        dragX += velX;
        dragY += velY;
        velX *= 0.94;
        velY *= 0.94;
        if (Math.abs(velX) < 0.002) velX = 0;
        if (Math.abs(velY) < 0.002) velY = 0;
      }

      // Clamp pitch between -32 and +32 deg
      const sx = Math.max(-32, Math.min(32, tilt + dragY));
      const sy = spin + dragX;

      // Apply transform to world
      world.style.transform = `translateZ(${camZ}px) rotateY(${sy}deg) rotateX(${sx}deg)`;

      // Apply counter-rotation to headline so it stays square to camera at the center
      headline.style.transform = `rotateX(${-sx}deg) rotateY(${-sy}deg) translateZ(${R * 0.62}px)`;

      // Compute depth for each card for depth-aware shading
      const radY = (sy * Math.PI) / 180;
      const radX = (sx * Math.PI) / 180;
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);

      cards.forEach((c, idx) => {
        const el = cardElementsRef.current[idx];
        if (!el) return;

        // Rotate unit vector (x, -y, z) by yaw around Y, then pitch around X
        const x1 = c.x * cosY + c.z * sinY;
        const z1 = -c.x * sinY + c.z * cosY;
        const y1 = -c.y; // note negative y in 3D coordinate convention
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const zf = z2; // depth in [-1, 1], +1 is closest to camera
        const base = 0.16 + 0.84 * Math.pow((zf + 1) / 2, 0.85);
        let dim = Math.max(0, Math.min(1, 1 - base));
        if (isLitOpen) {
          dim = Math.min(1, dim + 0.78);
        }

        el.style.setProperty('--d', dim.toFixed(3));
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Pointer Event Listeners
    const onPointerDown = (e) => {
      if (isLitOpen) return;
      isDragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
      isTouch = e.pointerType === 'touch';
      touchDecided = false;
      touchAllowed = false;

      // Identify if a card was clicked
      const cardEl = e.target.closest('.mri-card');
      if (cardEl) {
        const idx = parseInt(cardEl.dataset.idx, 10);
        clickedCandidate = { index: idx, element: cardEl };
      } else {
        clickedCandidate = null;
      }

      if (!isTouch) {
        stage.setPointerCapture(pointerId);
      }
    };

    const onPointerMove = (e) => {
      if (!isDragging || e.pointerId !== pointerId) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const totalDx = e.clientX - startX;
      const totalDy = e.clientY - startY;

      if (isTouch && !touchDecided) {
        const dist = Math.hypot(totalDx, totalDy);
        if (dist > 10) {
          touchDecided = true;
          // If vertical movement dominates, cancel sphere drag to let page scroll
          if (Math.abs(totalDy) > Math.abs(totalDx) * 1.15) {
            isDragging = false;
            touchAllowed = false;
            return;
          } else {
            touchAllowed = true;
            stage.setPointerCapture(pointerId);
          }
        } else {
          return;
        }
      }

      if (isTouch && !touchAllowed) return;

      // Rotation sensitivity: 0.13 deg/px
      dragX += dx * 0.13;
      dragY -= dy * 0.13;
      velX = dx * 0.13;
      velY = -dy * 0.13;

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerUp = (e) => {
      if (e.pointerId !== pointerId) return;
      isDragging = false;
      try {
        if (stage.hasPointerCapture(pointerId)) {
          stage.releasePointerCapture(pointerId);
        }
      } catch (err) {
        // ignore
      }

      // Check click slop
      const totalDist = Math.hypot(e.clientX - startX, e.clientY - startY);
      const slopLimit = isTouch ? 14 : 6;
      if (totalDist < slopLimit && clickedCandidate) {
        const specimen = cards[clickedCandidate.index];
        const rect = clickedCandidate.element.getBoundingClientRect();
        if (onSelectSpecimen) {
          onSelectSpecimen(specimen, rect);
        }
      }
      clickedCandidate = null;
    };

    const onPointerCancel = (e) => {
      if (e.pointerId === pointerId) {
        isDragging = false;
        clickedCandidate = null;
      }
    };

    // Keyboard rotation support
    const onKeyDown = (e) => {
      if (isLitOpen) return;
      if (e.key === 'ArrowLeft') {
        velX -= 0.6;
      } else if (e.key === 'ArrowRight') {
        velX += 0.6;
      } else if (e.key === 'ArrowUp') {
        velY += 0.4;
      } else if (e.key === 'ArrowDown') {
        velY -= 0.4;
      }
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(revealTimer);
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateDimensions);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [cards, isLitOpen, onSelectSpecimen]);

  return (
    <div
      ref={stageRef}
      id="stage"
      className={`sphere-stage ${revealed ? 'revealed' : ''}`}
      aria-label="Interactive 3D MRI Archive Sphere"
    >
      <div id="world" ref={worldRef}>
        <div id="orb" ref={orbRef}>
          {cards.map((card, idx) => (
            <div
              key={card.id}
              ref={(el) => (cardElementsRef.current[idx] = el)}
              className="mri-card"
              data-idx={idx}
              title={`${card.title} (${card.sequence})`}
            >
              <figure>
                <img
                  src={card.thumbPath}
                  alt={card.title}
                  loading="eager"
                  crossOrigin="anonymous"
                />
                <span className={`seq-chip ${card.sequence.toLowerCase().replace('+', '')}`}>
                  {card.sequence}
                </span>
              </figure>
            </div>
          ))}
        </div>

        {/* Center Headline: Stays locked at the sphere center */}
        <h1 id="headline" ref={headlineRef}>
          <span className="inner">
            <span className="word" style={{ '--i': 0 }}>Inside </span>
            <span className="word" style={{ '--i': 1 }}> the </span>
            <span className="word" style={{ '--i': 2 }}> Scan</span>
            <span className="sub">
              Exploring Medical Imagery Through Signal & Image Processing
            </span>
          </span>
        </h1>
      </div>

      {/* Vignette Overlay */}
      <div className="vig" />

      {/* Drag Cue */}
      <div className="cue">
        <s />
        <span>Drag to rotate · Click scan to inspect</span>
      </div>
    </div>
  );
}
