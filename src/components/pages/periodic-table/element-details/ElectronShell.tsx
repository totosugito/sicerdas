import { useEffect, useRef } from 'react';

interface ElectronShellProps {
  labelColor?: string;
  atomSymbol?: string;
  atomColor?: string;
  orbitStroke?: number;
  orbitColor?: string;
  speedDivider?: number;
  electronColor?: string;
  electrons: number[];
  size?: number;
  className?: string;
}

export const ElectronShell = ({
  labelColor = '#ffffff',
  atomSymbol = '',
  atomColor = '#8b5cf6',
  orbitStroke = 2,
  orbitColor = 'rgba(139, 92, 246, 0.4)',
  speedDivider = 1,
  electronColor = '#fbbf24',
  electrons,
  size = 300,
  className = '',
}: ElectronShellProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Parse color to get rgba for gradient
    const parseColorForGradient = (color: string) => {
      // Simple conversion for common formats
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
      }
      return { r: 251, g: 191, b: 36 }; // fallback yellow
    };

    const render = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const t = (timestamp - startTimeRef.current) / 1000; // time in seconds

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      const sz = size;
      const orbitSpacing = Math.floor(sz / 10); // Adjusted for better spacing
      const centerRadius = 18.0;
      const electronRadius = 4.0;

      ctx.save();
      ctx.translate(sz / 2, sz / 2);

      // Draw center circle (nucleus) with glow
      const nucleusGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, centerRadius * 1.5);
      nucleusGradient.addColorStop(0, atomColor);
      nucleusGradient.addColorStop(0.7, atomColor);
      nucleusGradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(0, 0, centerRadius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = nucleusGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = atomColor;
      ctx.fill();

      // Draw atom symbol
      ctx.fillStyle = labelColor;
      ctx.font = `bold ${centerRadius * 0.9}px "IBM Plex Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(atomSymbol, 0, 2);

      // Loop over orbits
      const orbits = electrons.length;
      for (let i = 0; i < orbits; i++) {
        const radius = centerRadius + orbitSpacing * (i + 1);

        // Draw orbit ring
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = orbitColor;
        ctx.lineWidth = orbitStroke;
        ctx.stroke();

        // Draw electrons
        const rotation = t / (speedDivider * (i + 1));
        const electronSpacing = (2 * Math.PI) / electrons[i];
        const { r, g, b } = parseColorForGradient(electronColor);

        for (let j = 0; j < electrons[i]; j++) {
          const angle = electronSpacing * j + rotation;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          // Electron glow effect
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, electronRadius * 1.5);
          gradient.addColorStop(0, electronColor);
          gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.6)`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(x, y, electronRadius * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Solid electron center
          ctx.beginPath();
          ctx.arc(x, y, electronRadius, 0, Math.PI * 2);
          ctx.fillStyle = electronColor;
          ctx.fill();
        }
      }

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [atomSymbol, atomColor, labelColor, orbitColor, orbitStroke, electronColor, electrons, speedDivider, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};
