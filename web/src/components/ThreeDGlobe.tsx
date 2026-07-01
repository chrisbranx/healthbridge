import { useEffect, useRef } from 'react';

export default function ThreeDGlobe({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;

    const resize = () => {
      const size = Math.min(400, window.innerWidth - 40);
      canvas.width = size;
      canvas.height = size;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = Math.min(cx, cy) * 0.7;

      // Outer glow
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0)');
      gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.05)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Globe circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
      ctx.fill();

      // Longitude lines (rotate with angle)
      for (let i = 0; i < 6; i++) {
        const rot = (i / 6) * Math.PI * 2 + angle;
        ctx.beginPath();
        for (let j = 0; j <= 100; j++) {
          const t = (j / 100) * Math.PI * 2;
          const x = cx + r * Math.sin(t) * Math.cos(rot);
          const y = cy + r * Math.cos(t);
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 + 0.15 * Math.abs(Math.cos(rot))})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Latitude lines
      for (let i = 0; i < 4; i++) {
        const t = ((i + 1) / 5) * Math.PI;
        const yr = r * Math.cos(t - Math.PI / 2);
        const xr = r * Math.sin(t - Math.PI / 2);
        if (xr < 1) continue;
        ctx.beginPath();
        ctx.ellipse(cx, cy + yr, xr, Math.abs(xr) * 0.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Pulsing markers on the globe
      const markers = [
        { lat: 0.3, lon: 0.2 + angle * 0.5 },
        { lat: -0.4, lon: 0.8 + angle * 0.5 },
        { lat: 0.6, lon: 1.5 + angle * 0.5 },
        { lat: -0.2, lon: 2.0 + angle * 0.5 },
      ];

      markers.forEach((m, idx) => {
        const mx = cx + r * Math.cos(m.lat) * Math.sin(m.lon);
        const my = cy + r * Math.sin(m.lat);
        const dist = Math.cos(m.lon);
        if (dist < 0) return;

        const pulse = Math.sin(Date.now() / 500 + idx * 1.5) * 0.3 + 0.7;
        const size = 3 + 2 * pulse;

        ctx.beginPath();
        ctx.arc(mx, my, size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${0.15 * pulse})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${0.6 * pulse})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * pulse})`;
        ctx.fill();
      });

      angle += 0.005;
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`${className} max-w-full h-auto`}
      aria-hidden="true"
    />
  );
}
