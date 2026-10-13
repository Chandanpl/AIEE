import React, { useEffect, useRef } from "react";

/**
 * CursorWaveEffect - Interactive liquid energy / wave ripple effect following the cursor
 *
 * Features:
 * - Fluid expanding concentric energy rings emitted on cursor movement.
 * - Ambient soft cyan/blue radial illumination field trailing the cursor.
 * - Pure Canvas 2D with zero external dependencies.
 * - High-performance: pauses RAF loop completely when the cursor is idle.
 * - Automatically disabled on touch screens and prefers-reduced-motion.
 * - pointer-events: none, ensuring zero interference with clicking, scrolling, or forms.
 */
export default function CursorWaveEffect({ theme = "dark" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Guard against touch devices and reduced-motion preferences
    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouchDevice || prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId = null;
    let isLoopRunning = false;
    let lastSpawnTime = 0;
    let lastSpawnPos = { x: -999, y: -999 };

    // Smoothed cursor position for the ambient radial aura
    const cursor = { x: -999, y: -999, targetX: -999, targetY: -999, intensity: 0 };
    const ripples = [];

    // Resize canvas to match window viewport
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Lerp smoothed cursor position
      cursor.x += (cursor.targetX - cursor.x) * 0.15;
      cursor.y += (cursor.targetY - cursor.y) * 0.15;
      cursor.intensity *= 0.96; // fade glow when stationary

      const isDark = theme !== "light";
      const primaryCyan = isDark ? "rgba(34, 211, 238," : "rgba(8, 145, 178,";
      const primaryBlue = isDark ? "rgba(96, 165, 250," : "rgba(37, 99, 235,";

      // 1. Render ambient cursor energy aura
      if (cursor.intensity > 0.01 && cursor.x > 0 && cursor.y > 0) {
        const auraRadius = isDark ? 160 : 130;
        const auraGrad = ctx.createRadialGradient(
          cursor.x,
          cursor.y,
          0,
          cursor.x,
          cursor.y,
          auraRadius
        );

        const auraAlpha = cursor.intensity * (isDark ? 0.08 : 0.06);
        auraGrad.addColorStop(0, `${primaryCyan} ${auraAlpha})`);
        auraGrad.addColorStop(0.5, `${primaryBlue} ${auraAlpha * 0.5})`);
        auraGrad.addColorStop(1, "transparent");

        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render and update expanding concentric ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity *= 0.94;

        if (r.opacity < 0.005 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        // Concentric outer ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${r.color} ${r.opacity})`;
        ctx.lineWidth = r.lineWidth;
        ctx.stroke();

        // Inner harmonic ripple ring
        if (r.radius > 16) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
          ctx.strokeStyle = `${r.color} ${r.opacity * 0.45})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Auto-pause loop when idle to preserve CPU
      if (ripples.length > 0 || cursor.intensity > 0.01) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        isLoopRunning = false;
      }
    };

    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    // Track mouse movement and spawn ripples
    const handlePointerMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      cursor.targetX = x;
      cursor.targetY = y;
      cursor.intensity = 1;

      if (cursor.x < 0) {
        cursor.x = x;
        cursor.y = y;
      }

      const now = performance.now();
      const dist = Math.hypot(x - lastSpawnPos.x, y - lastSpawnPos.y);

      // Throttle ripple emission: min 60ms interval and 16px displacement
      if (now - lastSpawnTime > 60 && dist > 16) {
        lastSpawnTime = now;
        lastSpawnPos = { x, y };

        const isDark = theme !== "light";
        const color = Math.random() > 0.4 ? primaryCyan : primaryBlue;

        ripples.push({
          x,
          y,
          radius: 6,
          maxRadius: Math.min(110, dist * 2 + 50),
          speed: 1.8 + Math.random() * 0.8,
          opacity: isDark ? 0.28 : 0.22,
          lineWidth: 1.25,
          color,
        });

        // Cap maximum simultaneous ripples for performance
        if (ripples.length > 12) {
          ripples.shift();
        }
      }

      startLoop();
    };

    const handlePointerLeave = () => {
      cursor.intensity = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave, { passive: true });

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-wave-canvas"
      aria-hidden="true"
    />
  );
}
