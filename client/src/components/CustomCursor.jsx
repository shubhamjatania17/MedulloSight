import React, { useEffect, useRef } from 'react';

/**
 * Custom Medical Inspect Cursor
 * Subtle dot tracking with lerp, expanding into an inspection reticle over interactive elements.
 * Automatically disabled on touch / mobile devices.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    if (isTouch) return;

    const dot = dotRef.current;
    if (!dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let animId = null;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check if hovering over interactive elements
      const target = e.target;
      const isInteractive = target && (
        target.closest('.mri-card') ||
        target.closest('.grid-card-item') ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('.hero-btn') ||
        target.closest('.filter-tab')
      );

      if (isInteractive) {
        dot.classList.add('wide');
      } else {
        dot.classList.remove('wide');
      }
    };

    const render = () => {
      // Lerp 0.2
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <div id="dot" ref={dotRef} aria-hidden="true" />;
}
