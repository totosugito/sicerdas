/**
 * Converts LaTeX math expressions into clean, readable Unicode for terminal TUI rendering.
 */

const SUPERSCRIPTS: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  n: "ⁿ",
  i: "ⁱ",
  x: "ˣ",
  y: "ʸ",
  a: "ᵃ",
  b: "ᵇ",
  c: "ᶜ",
  d: "ᵈ",
  e: "ᵉ",
  f: "ᶠ",
  g: "ᵍ",
  h: "ʰ",
  j: "ʲ",
  k: "ᵏ",
  l: "ˡ",
  m: "ᵐ",
  o: "ᵒ",
  p: "ᵖ",
  r: "ʳ",
  s: "ˢ",
  t: "ᵗ",
  u: "ᵘ",
  v: "ᵛ",
  w: "ʷ",
  z: "ᶻ",
};

const SUBSCRIPTS: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

const GREEK_AND_SYMBOLS: Record<string, string> = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ε",
  "\\varepsilon": "ε",
  "\\zeta": "ζ",
  "\\eta": "η",
  "\\theta": "θ",
  "\\vartheta": "ϑ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\xi": "ξ",
  "\\pi": "π",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\tau": "τ",
  "\\upsilon": "υ",
  "\\phi": "φ",
  "\\varphi": "φ",
  "\\chi": "χ",
  "\\psi": "ψ",
  "\\omega": "ω",
  "\\Gamma": "Γ",
  "\\Delta": "Δ",
  "\\Theta": "Θ",
  "\\Lambda": "Λ",
  "\\Xi": "Ξ",
  "\\Pi": "Π",
  "\\Sigma": "Σ",
  "\\Phi": "Φ",
  "\\Psi": "Ψ",
  "\\Omega": "Ω",
  "\\times": "×",
  "\\cdot": "·",
  "\\div": "÷",
  "\\pm": "±",
  "\\mp": "∓",
  "\\le": "≤",
  "\\leq": "≤",
  "\\ge": "≥",
  "\\geq": "≥",
  "\\neq": "≠",
  "\\ne": "≠",
  "\\approx": "≈",
  "\\equiv": "≡",
  "\\sim": "∼",
  "\\propto": "∝",
  "\\infty": "∞",
  "\\to": "→",
  "\\rightarrow": "→",
  "\\leftarrow": "←",
  "\\Rightarrow": "⇒",
  "\\Leftarrow": "⇐",
  "\\Leftrightarrow": "⇔",
  "\\iff": "⇔",
  "\\implies": "⇒",
  "\\in": "∈",
  "\\notin": "∉",
  "\\subset": "⊂",
  "\\subseteq": "⊆",
  "\\cup": "∪",
  "\\cap": "∩",
  "\\emptyset": "∅",
  "\\varnothing": "∅",
  "\\forall": "∀",
  "\\exists": "∃",
  "\\neg": "¬",
  "\\land": "∧",
  "\\lor": "∨",
  "\\sum": "∑",
  "\\prod": "∏",
  "\\int": "∫",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\angle": "∠",
  "\\triangle": "△",
  "\\perp": "⊥",
  "\\parallel": "∥",
  "\\degree": "°",
  "\\circ": "∘",
  "\\dots": "…",
  "\\ldots": "…",
  "\\cdots": "⋯",
  "\\mathbb{R}": "ℝ",
  "\\mathbb{N}": "ℕ",
  "\\mathbb{Z}": "ℤ",
  "\\mathbb{Q}": "ℚ",
  "\\mathbb{C}": "ℂ",
  "\\quad": "  ",
  "\\qquad": "    ",
  "\\,": " ",
  "\\;": " ",
  "\\!": "",
  "\\%": "%",
  "\\$": "$",
  "\\{": "{",
  "\\}": "}",
};

function toScript(text: string, map: Record<string, string>, fallbackPrefix: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  let out = "";
  for (const ch of trimmed) {
    if (map[ch]) {
      out += map[ch];
    } else {
      return trimmed.length > 1 ? `${fallbackPrefix}(${trimmed})` : `${fallbackPrefix}${trimmed}`;
    }
  }
  return out;
}

/** Extract balanced `{...}` group starting at `idx` (which must point to `{`). */
function readBraced(str: string, idx: number): { content: string; end: number } | null {
  if (str[idx] !== "{") return null;
  let depth = 0;
  for (let i = idx; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        return { content: str.slice(idx + 1, i), end: i + 1 };
      }
    }
  }
  return null;
}

/** Replace `\cmd{a}{b}` (like `\frac`) or `\cmd{a}` (like `\sqrt`, `\text`) recursively. */
function replaceCommands(expr: string): string {
  let out = expr;

  // Handle \frac{num}{den} iteratively (innermost first via recursion)
  let guard = 0;
  while (out.includes("\\frac") && guard++ < 20) {
    const idx = out.indexOf("\\frac");
    let pos = idx + 5;
    while (pos < out.length && out[pos] === " ") pos++;
    const num = readBraced(out, pos);
    if (!num) break;
    pos = num.end;
    while (pos < out.length && out[pos] === " ") pos++;
    const den = readBraced(out, pos);
    if (!den) break;

    const n = latexToUnicode(num.content);
    const d = latexToUnicode(den.content);
    const nWrapped = /[+\- ]/.test(n) && !n.startsWith("(") ? `(${n})` : n;
    const dWrapped = /[+\- ]/.test(d) && !d.startsWith("(") ? `(${d})` : d;
    out = out.slice(0, idx) + `${nWrapped}/${dWrapped}` + out.slice(den.end);
  }

  // Handle \sqrt{x}
  guard = 0;
  while (out.includes("\\sqrt") && guard++ < 20) {
    const idx = out.indexOf("\\sqrt");
    let pos = idx + 5;
    while (pos < out.length && out[pos] === " ") pos++;
    const arg = readBraced(out, pos);
    if (!arg) break;
    const inner = latexToUnicode(arg.content);
    const formatted = inner.length === 1 ? `√${inner}` : `√(${inner})`;
    out = out.slice(0, idx) + formatted + out.slice(arg.end);
  }

  // Handle \text{...}, \mathrm{...}, \mathbf{...}, \textbf{...}
  for (const cmd of ["\\text", "\\mathrm", "\\mathbf", "\\textbf", "\\textit"]) {
    guard = 0;
    while (out.includes(cmd) && guard++ < 20) {
      const idx = out.indexOf(cmd);
      let pos = idx + cmd.length;
      while (pos < out.length && out[pos] === " ") pos++;
      const arg = readBraced(out, pos);
      if (!arg) break;
      out = out.slice(0, idx) + arg.content + out.slice(arg.end);
    }
  }

  return out;
}

export function latexToUnicode(rawLatex: string): string {
  let s = rawLatex.trim();

  // Strip aligned / array / cases wrappers
  s = s.replace(/\\begin\{aligned\}|\\end\{aligned\}/g, "");
  s = s.replace(/\\begin\{align\*?\}|\\end\{align\*?\}/g, "");
  s = s.replace(/\\begin\{cases\}/g, "{ ").replace(/\\end\{cases\}/g, " }");
  s = s.replace(/\\left\s*([(\[{|.])/g, "$1");
  s = s.replace(/\\right\s*([)\]}|.])/g, "$1");
  s = s.replace(/\\left|\\right/g, "");
  s = s.replace(/\s*&\s*/g, " ");
  s = s.replace(/\s*\\\\\s*/g, "\n");

  // Recursive commands (\frac, \sqrt, \text, ...)
  s = replaceCommands(s);

  // Known symbols & Greek letters (longest key first to avoid prefix collisions)
  const keys = Object.keys(GREEK_AND_SYMBOLS).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    s = s.split(k).join(GREEK_AND_SYMBOLS[k]);
  }

  // Strip common function backslashes like \log, \sin, \cos, \tan, \lim
  s = s.replace(/\\(log|ln|sin|cos|tan|cot|sec|csc|lim|max|min|det|gcd)(?![a-zA-Z])/g, "$1");

  // Superscripts: ^{...} and ^x
  let guard = 0;
  while (s.includes("^{") && guard++ < 30) {
    const idx = s.indexOf("^{");
    const arg = readBraced(s, idx + 1);
    if (!arg) break;
    const inner = latexToUnicode(arg.content);
    s = s.slice(0, idx) + toScript(inner, SUPERSCRIPTS, "^") + s.slice(arg.end);
  }
  s = s.replace(/\^([0-9a-zA-Z])/g, (_, ch) => toScript(ch, SUPERSCRIPTS, "^"));

  // Subscripts: _{...} and _x
  guard = 0;
  while (s.includes("_{") && guard++ < 30) {
    const idx = s.indexOf("_{");
    const arg = readBraced(s, idx + 1);
    if (!arg) break;
    const inner = latexToUnicode(arg.content);
    s = s.slice(0, idx) + toScript(inner, SUBSCRIPTS, "_") + s.slice(arg.end);
  }
  s = s.replace(/_([0-9a-zA-Z])/g, (_, ch) => toScript(ch, SUBSCRIPTS, "_"));

  // Clean up remaining braces around simple tokens
  s = s.replace(/\{([^{}]+)\}/g, "$1");

  return s.replace(/[ \t]+/g, " ").trim();
}
