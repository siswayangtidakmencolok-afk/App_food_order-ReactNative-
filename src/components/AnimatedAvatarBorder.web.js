// Animated border 3 lapis pakai CSS conic-gradient berputar
// Efek berbeda dari aurora — ini lebih seperti plasma energy ring

import { useEffect, useRef } from 'react';

export default function AnimatedAvatarBorder({ initials, size = 100, accentColor = '#FF6347' }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const S    = size * 2; // retina
    canvas.width  = S;
    canvas.height = S;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';

    let t = 0;

    // Parse hex to rgb
    const hexToRgb = hex => {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return { r, g, b };
    };
    const { r, g, b } = hexToRgb(accentColor);

    const draw = () => {
      ctx.clearRect(0, 0, S, S);
      const cx = S / 2, cy = S / 2;

      // ── Ring 3 — paling luar, lambat, warna pucat ──
      for (let i = 0; i < 360; i += 3) {
        const angle  = (i + t * 0.3) * Math.PI / 180;
        const radius = S * 0.46;
        const alpha  = (Math.sin((i + t * 2) * Math.PI / 180) + 1) / 2 * 0.3;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius,
          2, 0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      // ── Ring 2 — tengah, cepat, lebih terang ──
      for (let i = 0; i < 360; i += 4) {
        const angle  = (i - t * 0.8) * Math.PI / 180;
        const radius = S * 0.42;
        const alpha  = (Math.sin((i + t * 3) * Math.PI / 180) + 1) / 2 * 0.5;
        const dotSize = alpha * 4 + 1;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(angle) * radius,
          cy + Math.sin(angle) * radius,
          dotSize, 0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      // ── Ring 1 — paling dalam, pulse glow ──
      const glowRadius = S * 0.38;
      const gradient   = ctx.createRadialGradient(cx, cy, glowRadius - 8, cx, cy, glowRadius + 8);
      const pulse = (Math.sin(t * 0.05) + 1) / 2;
      gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
      gradient.addColorStop(0.5, `rgba(${r},${g},${b},${0.3 + pulse * 0.4})`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth   = 8;
      ctx.stroke();

      // ── Arc merah menyala — berputar ──
      const arcAngle = (t * 1.5) * Math.PI / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, arcAngle, arcAngle + Math.PI * 0.7);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
      ctx.lineWidth   = 3;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Titik ujung arc yang bersinar
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(arcAngle + Math.PI * 0.7) * glowRadius,
        cy + Math.sin(arcAngle + Math.PI * 0.7) * glowRadius,
        5, 0, Math.PI * 2
      );
      ctx.fillStyle = `rgba(255,255,255,0.9)`;
      ctx.fill();

      t++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size, accentColor]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Canvas border animasi */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      {/* Avatar lingkaran di tengah */}
      <div style={{
        position:        'absolute',
        top:             '50%',
        left:            '50%',
        transform:       'translate(-50%, -50%)',
        width:           size * 0.68,
        height:          size * 0.68,
        borderRadius:    '50%',
        background:      'linear-gradient(135deg, rgba(255,99,71,0.3), rgba(255,69,0,0.5))',
        border:          '2px solid rgba(255,99,71,0.5)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        fontSize:        size * 0.24,
        fontWeight:      '900',
        color:           '#fff',
        letterSpacing:   1,
        backdropFilter:  'blur(10px)',
        zIndex:          2,
      }}>
        {initials}
      </div>
    </div>
  );
}