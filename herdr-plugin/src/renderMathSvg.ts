import fs from "fs";
import path from "path";
import crypto from "crypto";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svgJax = new SVG({ fontCache: "none" });
const doc = mathjax.document("", { InputJax: tex, OutputJax: svgJax });

interface MathRequest {
  latex: string;
  display?: boolean;
  color?: string;
  pxPerEx?: number;
}

const input = fs.readFileSync(0, "utf-8");
const payload = JSON.parse(input) as { outDir: string; items: MathRequest[] };
fs.mkdirSync(payload.outDir, { recursive: true });

const results: Record<string, { file: string; width: number; height: number }> = {};

for (const item of payload.items) {
  const latex = String(item.latex ?? "").trim();
  if (!latex) continue;
  const color = item.color || "#e5e7eb";
  const display = item.display !== false;
  const pxPerEx = item.pxPerEx || (display ? 11 : 9.5);
  const cacheKey = `${display ? "D" : "I"}:${latex}`;
  const hash = crypto
    .createHash("sha1")
    .update(`${color}|${pxPerEx}|${cacheKey}`)
    .digest("hex")
    .slice(0, 16);
  const fileName = `math_${hash}.svg`;
  const absPath = path.join(payload.outDir, fileName);

  if (fs.existsSync(absPath)) {
    const existing = fs.readFileSync(absPath, "utf-8");
    const wm = existing.match(/width="(\d+(?:\.\d+)?)px"/);
    const hm = existing.match(/height="(\d+(?:\.\d+)?)px"/);
    results[cacheKey] = {
      file: fileName,
      width: wm ? Math.ceil(Number(wm[1])) : 200,
      height: hm ? Math.ceil(Number(hm[1])) : 40,
    };
    continue;
  }

  try {
    const node = doc.convert(latex, { display });
    let svgStr = adaptor.innerHTML(node);

    const wEx = svgStr.match(/width="([\d.]+)ex"/);
    const hEx = svgStr.match(/height="([\d.]+)ex"/);
    const width = wEx ? Math.max(8, Math.ceil(parseFloat(wEx[1]) * pxPerEx)) : 120;
    const height = hEx ? Math.max(12, Math.ceil(parseFloat(hEx[1]) * pxPerEx)) : 24;

    svgStr = svgStr
      .replace("<svg ", '<svg shape-rendering="geometricPrecision" ')
      .replace(/width="[\d.]+ex"/, `width="${width}px"`)
      .replace(/height="[\d.]+ex"/, `height="${height}px"`)
      .replace(/currentColor/g, color)
      .replace(/stroke-width="0"/, 'stroke-width="18"');

    fs.writeFileSync(absPath, svgStr, "utf-8");
    results[cacheKey] = { file: fileName, width, height };
  } catch {
    // Skip invalid TeX
  }
}

process.stdout.write(JSON.stringify(results));
