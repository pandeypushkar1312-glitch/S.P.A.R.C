import React, { useEffect, useState } from 'react';

export const ParallaxBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animFrame: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -1 to 1 based on center of screen
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Smooth Lerp animation for effortless buttery motion
    const loop = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      setMousePos({ x: currentX, y: currentY });
      animFrame = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    animFrame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  const { x, y } = mousePos;

  return (
    <div className="parallax-illusion-container" aria-hidden="true">
      {/* Layer 0: Ambient Deep Sunburst Aura */}
      <div
        className="parallax-layer parallax-layer-0"
        style={{
          transform: `translate3d(${x * 15}px, ${y * 15 + scrollY * 0.04}px, 0)`
        }}
      >
        <div className="parallax-orb parallax-orb-solar" />
        <div className="parallax-orb parallax-orb-cyan" />
      </div>

      {/* Layer 1: Perspective Optical Grid (Tilts with 3D Depth) */}
      <div
        className="parallax-layer parallax-layer-1"
        style={{
          transform: `perspective(800px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) translate3d(${x * -25}px, ${y * -25 - scrollY * 0.08}px, 0)`
        }}
      >
        <div className="parallax-grid-lines" />
      </div>

      {/* Layer 2: Optical Illusion Moire Interference Rings */}
      <div
        className="parallax-layer parallax-layer-2"
        style={{
          transform: `translate3d(${x * 45}px, ${y * 45 - scrollY * 0.12}px, 0)`
        }}
      >
        {/* Ring A */}
        <div
          className="moire-circle moire-circle-a"
          style={{
            transform: `translate(${x * 20}px, ${y * 20}px) scale(${1 + Math.abs(x) * 0.05})`
          }}
        />
        {/* Ring B (Interferes with Ring A to create shifting 3D optical ripple pattern) */}
        <div
          className="moire-circle moire-circle-b"
          style={{
            transform: `translate(${x * -25}px, ${y * -25}px)`
          }}
        />

        {/* Floating Geometric Illusion Polyhedra / Hexagons */}
        <svg className="parallax-float-shape shape-hex-1" width="120" height="120" viewBox="0 0 100 100">
          <polygon
            points="50,5 90,25 90,75 50,95 10,75 10,25"
            fill="none"
            stroke="var(--accent-solar)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            opacity="0.45"
          />
          <circle cx="50" cy="50" r="16" fill="none" stroke="var(--accent-solar)" strokeWidth="0.8" opacity="0.3" />
        </svg>

        <svg className="parallax-float-shape shape-hex-2" width="160" height="160" viewBox="0 0 100 100">
          <polygon
            points="50,5 90,25 90,75 50,95 10,75 10,25"
            fill="none"
            stroke="var(--accent-sim)"
            strokeWidth="1"
            opacity="0.3"
          />
          <line x1="50" y1="5" x2="50" y2="95" stroke="var(--accent-sim)" strokeWidth="0.6" opacity="0.25" />
          <line x1="10" y1="25" x2="90" y2="75" stroke="var(--accent-sim)" strokeWidth="0.6" opacity="0.25" />
          <line x1="10" y1="75" x2="90" y2="25" stroke="var(--accent-sim)" strokeWidth="0.6" opacity="0.25" />
        </svg>
      </div>

      {/* Layer 3: Foreground High-Speed Parallax Dust & Crosshairs */}
      <div
        className="parallax-layer parallax-layer-3"
        style={{
          transform: `translate3d(${x * -75}px, ${y * -75 - scrollY * 0.18}px, 0)`
        }}
      >
        <div className="crosshair crosshair-1">+</div>
        <div className="crosshair crosshair-2">+</div>
        <div className="crosshair crosshair-3">+</div>
        <div className="crosshair crosshair-4">+</div>
        <div className="floating-dust dust-1" />
        <div className="floating-dust dust-2" />
        <div className="floating-dust dust-3" />
      </div>
    </div>
  );
};
