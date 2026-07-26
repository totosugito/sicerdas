import { useEffect, useRef } from 'react';

interface ElectronShellProps {
  labelColor?: string;
  atomSymbol?: string;
  atomColor?: string;
  orbitStroke?: number;
  orbitColor?: string;
  orbitColors?: string[];
  speedDivider?: number;
  electronColor?: string;
  electrons: number[];
  className?: string;
}

export const ElectronShell = ({
  labelColor = '#ffffff',
  atomSymbol = '',
  atomColor = '#8b5cf6',
  orbitStroke = 1.5,
  orbitColor = 'rgba(139, 92, 246, 0.4)',
  orbitColors, // Will use default colors if not provided
  speedDivider = 1,
  electronColor = '#fbbf24',
  electrons,
  className = '',
}: ElectronShellProps) => {
  // Calculate canvas size based on number of electron shells
  const calculatedCanvasSize = electrons.length > 0 
    ? Math.min(300, (18.0 + 15.0 * electrons.length) * 2.2) // centerRadius + orbitSpacing * numOrbits, plus padding
    : 300;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Default colors for up to 8 orbits
  const defaultOrbitColors = [
    'rgba(139, 92, 246, 0.4)', // purple
    'rgba(147, 51, 234, 0.4)', // purple-600
    'rgba(219, 39, 119, 0.4)', // pink
    'rgba(249, 115, 22, 0.4)',  // orange
    'rgba(59, 130, 246, 0.4)',  // blue
    'rgba(14, 165, 233, 0.4)',  // cyan
    'rgba(16, 185, 129, 0.4)',  // emerald
    'rgba(245, 158, 11, 0.4)',  // amber
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = calculatedCanvasSize * dpr;
    canvas.height = calculatedCanvasSize * dpr;
    canvas.style.width = `${calculatedCanvasSize}px`;
    canvas.style.height = `${calculatedCanvasSize}px`;
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
      ctx.clearRect(0, 0, calculatedCanvasSize, calculatedCanvasSize);

      const sz = calculatedCanvasSize;
      const orbitSpacing = 15.0;
      const centerRadius = 18.0;
      const electronRadius = 4.0;

      ctx.save();
      ctx.translate(sz / 2, sz / 2);

      ctx.beginPath();
      ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = atomColor;
      ctx.fill();

      // Draw atom symbol
      ctx.fillStyle = labelColor;
      ctx.font = `bold ${centerRadius * 0.8}px "IBM Plex Sans", sans-serif`;
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
        // Use specific orbit color if provided, otherwise use default orbit color from the default list
        ctx.strokeStyle = orbitColors?.[i] || defaultOrbitColors[i] || orbitColor;
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
  }, [atomSymbol, atomColor, labelColor, orbitColor, orbitStroke, electronColor, electrons, speedDivider, calculatedCanvasSize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: calculatedCanvasSize, height: calculatedCanvasSize }}
    />
  );
};
