const fs = require('fs');
const path = require('path');
const echarts = require('echarts');
const { createCanvas } = require('canvas');
const { execSync } = require('child_process');

const specPath = process.argv[2];
const outPath = process.argv[3];

if (!specPath || !outPath) {
  console.error("Usage: node render_echarts.cjs <spec.json> <output.png> [width] [height]");
  process.exit(1);
}

try {
  const jsonStr = fs.readFileSync(specPath, 'utf-8');
  const spec = JSON.parse(jsonStr);

  // Clean up non-echarts custom fields
  delete spec.type;
  delete spec.chartType;

  // Default background for PNG
  if (!spec.backgroundColor) {
    spec.backgroundColor = '#ffffff';
  }

  // Ensure labels inside charts aren't animated so SSR works synchronously
  if (!spec.animation) {
    spec.animation = false;
  }

  // Default global typography
  if (!spec.textStyle) {
    spec.textStyle = { fontSize: 14, fontFamily: 'sans-serif' };
  } else if (!spec.textStyle.fontSize) {
    spec.textStyle.fontSize = 14;
  }

  const width = parseInt(process.argv[4]) || 600;
  const height = parseInt(process.argv[5]) || 400;

  // Auto-estimate tight grid padding relative to canvas size to prevent bloated whitespace
  const hasVisibleAxis = (spec.xAxis && spec.xAxis.show !== false) || (spec.yAxis && spec.yAxis.show !== false);
  if (!spec.grid && (spec.xAxis || spec.yAxis)) {
    if (hasVisibleAxis) {
      // Cartesian graphs with visible axes/arrows/labels: ~6-9% padding
      spec.grid = {
        left: Math.max(25, Math.round(width * 0.06)),
        right: Math.max(35, Math.round(width * 0.08)),
        top: Math.max(35, Math.round(height * 0.09)),
        bottom: Math.max(25, Math.round(height * 0.07))
      };
    } else {
      // Geometry/diagrams with hidden axes: ~3-5% minimal tight padding
      spec.grid = {
        left: Math.max(15, Math.round(width * 0.04)),
        right: Math.max(15, Math.round(width * 0.04)),
        top: Math.max(15, Math.round(height * 0.04)),
        bottom: Math.max(15, Math.round(height * 0.04))
      };
    }
  }

  const canvas = createCanvas(width, height);
  const chartCanvas = echarts.init(canvas, null, { renderer: 'canvas' });
  chartCanvas.setOption(spec);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  
  try {
    // Compress the PNG in-place to 16 colors
    execSync(`pngquant 16 --ext .png --force "${outPath}"`, { stdio: 'ignore' });
  } catch (err) {
    console.warn(`[ECharts Render] Warning: pngquant compression failed on ${outPath}. Ensure pngquant is installed.`);
  }

  // Render SVG using node-canvas svg backend
  // const svgOutPath = outPath.replace('.png', '.svg');
  // const canvasSvg = createCanvas(width, height, 'svg');
  // const chartSvg = echarts.init(canvasSvg, null, { renderer: 'canvas' });
  // chartSvg.setOption(spec);
  // fs.writeFileSync(svgOutPath, canvasSvg.toBuffer());

  console.log(`[ECharts Render] Successfully rendered PNG to ${outPath}`);
} catch (error) {
  console.error(`[ECharts Render] Error rendering ${specPath}:`, error.message);
  process.exit(1);
}
