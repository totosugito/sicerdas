/** ANSI color & text-wrapping helpers for TUI rendering. */

export const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  inverse: "\x1b[7m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  brightCyan: "\x1b[96m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightMagenta: "\x1b[95m",
  bgBlue: "\x1b[44m",
  bgGray: "\x1b[100m",
};

const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

export function stripAnsi(str: string): string {
  return str.replace(ANSI_REGEX, "");
}

export function visibleLength(str: string): number {
  return stripAnsi(str).length;
}

/** Pad or truncate a single-line ANSI string to exact `width` columns. */
export function fitLine(str: string, width: number): string {
  if (width <= 0) return "";
  const plain = stripAnsi(str);
  if (plain.length <= width) {
    return str + " ".repeat(width - plain.length);
  }
  // Walk string preserving ANSI escapes until `width - 1` visible chars
  let out = "";
  let vis = 0;
  let i = 0;
  const target = Math.max(0, width - 1);
  while (i < str.length && vis < target) {
    if (str[i] === "\x1b") {
      const m = str.slice(i).match(/^\x1b\[[0-9;]*m/);
      if (m) {
        out += m[0];
        i += m[0].length;
        continue;
      }
    }
    out += str[i];
    vis++;
    i++;
  }
  return out + ANSI.reset + "…";
}

/** Word-wrap plain or ANSI-styled text to `maxWidth` columns. */
export function wrapText(text: string, maxWidth: number): string[] {
  if (maxWidth <= 4) return [text];
  const lines: string[] = [];
  for (const rawLine of text.split("\n")) {
    if (visibleLength(rawLine) <= maxWidth) {
      lines.push(rawLine);
      continue;
    }
    const words = rawLine.split(" ");
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (visibleLength(candidate) <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}
