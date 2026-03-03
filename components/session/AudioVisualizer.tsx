"use client";

import { useRef, useEffect, useCallback } from "react";

interface AudioVisualizerProps {
  profile: "drift" | "pulse" | "depth";
  isPlaying: boolean;
}

const COLORS = {
  drift: { r: 167, g: 139, b: 250 }, // #A78BFA
  pulse: { r: 96, g: 165, b: 250 }, // #60A5FA
  depth: { r: 52, g: 211, b: 153 }, // #34D399
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export function AudioVisualizer({ profile, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  const createParticle = useCallback(
    (width: number, height: number): Particle => {
      const centerX = width / 2;
      const centerY = height / 2;
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(width, height) * 0.3;

      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: 0,
        life: 0,
        maxLife: 200 + Math.random() * 300,
      };
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const count = profile === "pulse" ? 80 : profile === "drift" ? 120 : 60;
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width, canvas.height)
    );

    const color = COLORS[profile];

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      ctx.fillStyle = "rgba(5, 5, 12, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!isPlaying) {
        // Static dim state
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.02)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Fade in/out
        if (p.life < 30) {
          p.alpha = p.life / 30;
        } else if (p.life > p.maxLife - 30) {
          p.alpha = (p.maxLife - p.life) / 30;
        } else {
          p.alpha = 1;
        }

        // Movement based on profile
        if (profile === "drift") {
          // Flow field movement
          const angle =
            Math.sin(p.x * 0.003 + t * 0.2) * Math.cos(p.y * 0.003 + t * 0.15) * Math.PI;
          p.vx += Math.cos(angle) * 0.02;
          p.vy += Math.sin(angle) * 0.02;
          p.vx *= 0.98;
          p.vy *= 0.98;
        } else if (profile === "pulse") {
          // Radial pulse
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pulseForce = Math.sin(t * 2) * 0.05;
          p.vx += (dx / (dist || 1)) * pulseForce;
          p.vy += (dy / (dist || 1)) * pulseForce;
          p.vx *= 0.96;
          p.vy *= 0.96;
        } else {
          // Depth: slow nebula drift
          p.vx += (Math.random() - 0.5) * 0.01;
          p.vy += (Math.random() - 0.5) * 0.01;
          p.vx *= 0.995;
          p.vy *= 0.995;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Respawn if dead or out of bounds
        if (
          p.life >= p.maxLife ||
          p.x < -50 ||
          p.x > canvas.width + 50 ||
          p.y < -50 ||
          p.y > canvas.height + 50
        ) {
          const newP = createParticle(canvas.width, canvas.height);
          particles[i] = newP;
          continue;
        }

        // Draw
        const drawAlpha = p.alpha * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${drawAlpha})`;
        ctx.fill();

        // Glow effect for larger particles
        if (p.size > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${drawAlpha * 0.1})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [profile, isPlaying, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#05050C" }}
    />
  );
}
