import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { ANSI } from "./ansi";

function commandExists(cmd: string): boolean {
  try {
    execFileSync("which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const HAS_CHAFA = commandExists("chafa");
const HAS_VIU = commandExists("viu");

export function isImageFile(filePath: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg|ico)$/i.test(filePath);
}

/**
 * Renders an image preview for terminal TUI:
 * - Uses `chafa` or `viu` if installed (works cleanly inside any ANSI TUI pane)
 * - Falls back to file metadata + Kitty Graphics hint if neither is installed
 */
export function renderImageLines(filePath: string, width: number, height: number): string[] {
  const lines: string[] = [];
  const stats = fs.statSync(filePath);
  const sizeKb = (stats.size / 1024).toFixed(1);
  const ext = path.extname(filePath).slice(1).toUpperCase();

  lines.push(
    `${ANSI.bold}${ANSI.cyan}Image Preview:${ANSI.reset} ${path.basename(filePath)} (${ext}, ${sizeKb} KB)`,
  );
  lines.push(`${ANSI.gray}${"─".repeat(Math.min(width - 2, 60))}${ANSI.reset}`);

  const targetW = Math.max(20, width - 4);
  const targetH = Math.max(10, height - 6);

  if (HAS_CHAFA && !filePath.toLowerCase().endsWith(".svg")) {
    try {
      const out = execFileSync(
        "chafa",
        ["--size", `${targetW}x${targetH}`, "--animate=off", filePath],
        { encoding: "utf-8", timeout: 2000 },
      );
      lines.push(...out.split("\n"));
      return lines;
    } catch {
      // fallback below
    }
  }

  if (HAS_VIU && !filePath.toLowerCase().endsWith(".svg")) {
    try {
      const out = execFileSync("viu", ["-w", String(targetW), "-h", String(targetH), filePath], {
        encoding: "utf-8",
        timeout: 2000,
      });
      lines.push(...out.split("\n"));
      return lines;
    } catch {
      // fallback below
    }
  }

  lines.push("");
  lines.push(`${ANSI.yellow}Path:${ANSI.reset} ${filePath}`);
  lines.push(
    `${ANSI.gray}Tip: Install 'chafa' (sudo apt install chafa) untuk preview gambar langsung di TUI.${ANSI.reset}`,
  );
  return lines;
}
