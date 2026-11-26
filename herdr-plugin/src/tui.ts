import fs from "fs";
import path from "path";
import { ANSI, fitLine } from "./ansi";
import { buildVisibleTree, TreeItem } from "./fsTree";
import { renderMarkdownContent } from "./renderMarkdown";
import { renderJsonContent } from "./renderJsonQuestion";
import { isImageFile, renderImageLines } from "./renderImage";

type FocusPane = "explorer" | "viewer";

export class SicerdasTui {
  private rootDir: string;
  private expandedDirs = new Set<string>();
  private treeItems: TreeItem[] = [];
  private cursor = 0;
  private treeScroll = 0;

  private selectedFile: string | null = null;
  private rawContent = "";
  private renderedLines: string[] = [];
  private viewerScroll = 0;

  private variationIndex: number | "raw" = 0;
  private variableSetsCount = 0;
  private showRaw = false;
  private showExplorer = true;
  private focus: FocusPane = "explorer";

  constructor(startDir: string) {
    this.rootDir = path.resolve(startDir);
    this.refreshTree();
  }

  private refreshTree() {
    this.treeItems = buildVisibleTree(this.rootDir, this.expandedDirs);
    if (this.cursor >= this.treeItems.length) {
      this.cursor = Math.max(0, this.treeItems.length - 1);
    }
  }

  private getLayout() {
    const cols = process.stdout.columns || 100;
    const rows = process.stdout.rows || 30;
    const sidebarW = this.showExplorer ? Math.min(34, Math.max(22, Math.floor(cols * 0.28))) : 0;
    const viewerW = this.showExplorer ? Math.max(20, cols - sidebarW - 1) : cols;
    const bodyH = Math.max(5, rows - 2); // 1 header + 1 footer
    return { cols, rows, sidebarW, viewerW, bodyH };
  }

  private loadFile(filePath: string) {
    this.selectedFile = filePath;
    this.viewerScroll = 0;
    this.variationIndex = 0;
    if (!isImageFile(filePath)) {
      try {
        this.rawContent = fs.readFileSync(filePath, "utf-8");
      } catch (err: any) {
        this.rawContent = `Error reading file: ${err?.message ?? err}`;
      }
    } else {
      this.rawContent = "";
    }
    this.rerenderViewer();
  }

  private rerenderViewer() {
    if (!this.selectedFile) {
      this.renderedLines = [
        "",
        `  ${ANSI.bold}${ANSI.cyan}Sicerdas Viewer${ANSI.reset}`,
        `  ${ANSI.gray}Pilih file .md, .json, atau gambar di panel kiri lalu tekan Enter.${ANSI.reset}`,
        "",
        `  ${ANSI.yellow}Shortcuts:${ANSI.reset}`,
        `    ↑/↓, j/k    Navigasi / Scroll`,
        `    Enter       Buka file / Expand folder`,
        `    Tab         Pindah fokus Explorer ↔ Viewer`,
        `    v / 1-9 / 0 Ganti Variable Set / Template`,
        `    r           Toggle Formatted ↔ Raw`,
        `    e           Toggle Explorer`,
        `    Backspace   Naik ke parent folder`,
        `    q           Keluar`,
      ];
      return;
    }

    const { viewerW, bodyH } = this.getLayout();

    if (isImageFile(this.selectedFile)) {
      this.variableSetsCount = 0;
      this.renderedLines = renderImageLines(this.selectedFile, viewerW, bodyH);
      return;
    }

    if (this.showRaw) {
      this.renderedLines = this.rawContent.split(/\r?\n/);
      return;
    }

    const ext = path.extname(this.selectedFile).toLowerCase();
    if (ext === ".md") {
      const res = renderMarkdownContent(this.rawContent, viewerW, this.variationIndex);
      this.variableSetsCount = res.variableSetsCount;
      this.renderedLines = res.lines;
    } else if (ext === ".json") {
      const res = renderJsonContent(this.rawContent, viewerW, this.variationIndex);
      this.variableSetsCount = res.variableSetsCount;
      this.renderedLines = res.lines;
    } else {
      this.variableSetsCount = 0;
      this.renderedLines = this.rawContent.split(/\r?\n/);
    }
  }

  private draw() {
    const { cols, sidebarW, viewerW, bodyH } = this.getLayout();
    const out: string[] = [];

    // Header bar
    const fileLabel = this.selectedFile
      ? path.relative(this.rootDir, this.selectedFile) || path.basename(this.selectedFile)
      : path.basename(this.rootDir);
    const modeBadge = this.showRaw ? "[RAW]" : "[FORMATTED]";
    const varBadge =
      this.variableSetsCount > 0
        ? this.variationIndex === "raw"
          ? " [Template]"
          : ` [Set ${Number(this.variationIndex) + 1}/${this.variableSetsCount}]`
        : "";
    const header = `${ANSI.bgBlue}${ANSI.white}${ANSI.bold} Sicerdas Viewer ${ANSI.reset}${ANSI.bgBlue}${ANSI.white} ${fileLabel} ${modeBadge}${varBadge}${ANSI.reset}`;
    out.push(fitLine(header, cols));

    // Adjust scroll windows
    if (this.cursor < this.treeScroll) this.treeScroll = this.cursor;
    if (this.cursor >= this.treeScroll + bodyH) this.treeScroll = this.cursor - bodyH + 1;

    const maxViewerScroll = Math.max(0, this.renderedLines.length - bodyH);
    if (this.viewerScroll > maxViewerScroll) this.viewerScroll = maxViewerScroll;
    if (this.viewerScroll < 0) this.viewerScroll = 0;

    // Body rows
    for (let r = 0; r < bodyH; r++) {
      let leftCell = "";
      if (this.showExplorer) {
        const idx = this.treeScroll + r;
        const item = this.treeItems[idx];
        if (item) {
          const indent = "  ".repeat(item.depth);
          const icon = item.isDirectory
            ? item.expanded
              ? "▾ "
              : "▸ "
            : item.name.endsWith(".md")
              ? "M "
              : item.name.endsWith(".json")
                ? "J "
                : isImageFile(item.name)
                  ? "I "
                  : "  ";
          const isCur = idx === this.cursor;
          const color = item.isDirectory
            ? ANSI.yellow
            : item.name.endsWith(".md")
              ? ANSI.cyan
              : item.name.endsWith(".json")
                ? ANSI.green
                : isImageFile(item.name)
                  ? ANSI.magenta
                  : ANSI.white;
          const rawLabel = `${indent}${icon}${item.name}`;
          if (isCur) {
            const bg = this.focus === "explorer" ? ANSI.bgBlue : ANSI.bgGray;
            leftCell = `${bg}${ANSI.white}${fitLine(rawLabel, sidebarW)}${ANSI.reset}`;
          } else {
            leftCell = fitLine(`${color}${rawLabel}${ANSI.reset}`, sidebarW);
          }
        } else {
          leftCell = " ".repeat(sidebarW);
        }
      }

      const vLine = this.renderedLines[this.viewerScroll + r] ?? "";
      const rightCell = fitLine(vLine, viewerW);
      const sep = this.showExplorer ? `${ANSI.gray}│${ANSI.reset}` : "";
      out.push(`${leftCell}${sep}${rightCell}`);
    }

    // Footer status bar
    const focusLabel = this.focus === "explorer" ? "EXPLORER" : "VIEWER";
    const scrollPct =
      this.renderedLines.length > bodyH
        ? `${Math.round(((this.viewerScroll + bodyH) / this.renderedLines.length) * 100)}%`
        : "ALL";
    const footer = `${ANSI.gray}[${focusLabel}] Tab:Focus  Enter:Open  v:VarSet  r:Raw  e:Sidebar  Backspace:Up  q:Quit  (${scrollPct})${ANSI.reset}`;
    out.push(fitLine(footer, cols));

    process.stdout.write("\x1b[H" + out.join("\n"));
  }

  private handleKey(chunk: Buffer) {
    const key = chunk.toString("utf-8");

    if (key === "\x03" || key === "q") {
      this.cleanup();
      process.exit(0);
    }

    if (key === "\t") {
      if (this.showExplorer) {
        this.focus = this.focus === "explorer" ? "viewer" : "explorer";
      }
      this.draw();
      return;
    }

    if (key === "e") {
      this.showExplorer = !this.showExplorer;
      if (!this.showExplorer) this.focus = "viewer";
      this.rerenderViewer();
      this.draw();
      return;
    }

    if (key === "r") {
      this.showRaw = !this.showRaw;
      this.viewerScroll = 0;
      this.rerenderViewer();
      this.draw();
      return;
    }

    if (key === "v" && this.variableSetsCount > 0) {
      if (this.variationIndex === "raw") this.variationIndex = 0;
      else if (this.variationIndex + 1 < this.variableSetsCount) this.variationIndex++;
      else this.variationIndex = "raw";
      this.rerenderViewer();
      this.draw();
      return;
    }

    if (/^[0-9]$/.test(key) && this.variableSetsCount > 0) {
      const n = Number(key);
      if (n === 0) this.variationIndex = "raw";
      else if (n <= this.variableSetsCount) this.variationIndex = n - 1;
      this.rerenderViewer();
      this.draw();
      return;
    }

    const { bodyH } = this.getLayout();
    const isUp = key === "\x1b[A" || key === "k";
    const isDown = key === "\x1b[B" || key === "j";
    const isPgUp = key === "\x1b[5~";
    const isPgDn = key === "\x1b[6~";

    if (this.focus === "explorer") {
      if (isUp && this.cursor > 0) this.cursor--;
      else if (isDown && this.cursor < this.treeItems.length - 1) this.cursor++;
      else if (isPgUp) this.cursor = Math.max(0, this.cursor - bodyH);
      else if (isPgDn) this.cursor = Math.min(this.treeItems.length - 1, this.cursor + bodyH);
      else if (key === "\r" || key === "\n" || key === " ") {
        const item = this.treeItems[this.cursor];
        if (item) {
          if (item.isDirectory) {
            if (this.expandedDirs.has(item.path)) this.expandedDirs.delete(item.path);
            else this.expandedDirs.add(item.path);
            this.refreshTree();
          } else {
            this.loadFile(item.path);
          }
        }
      } else if (key === "\x7f" || key === "\b") {
        const parent = path.dirname(this.rootDir);
        if (parent !== this.rootDir) {
          this.rootDir = parent;
          this.cursor = 0;
          this.treeScroll = 0;
          this.refreshTree();
        }
      }
    } else {
      if (isUp) this.viewerScroll--;
      else if (isDown) this.viewerScroll++;
      else if (isPgUp) this.viewerScroll -= Math.max(1, bodyH - 2);
      else if (isPgDn) this.viewerScroll += Math.max(1, bodyH - 2);
      else if (key === "g") this.viewerScroll = 0;
      else if (key === "G") this.viewerScroll = Math.max(0, this.renderedLines.length - bodyH);
    }

    this.draw();
  }

  private cleanup() {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdout.write("\x1b[?25h\x1b[?1049l");
  }

  public start() {
    process.stdout.write("\x1b[?1049h\x1b[?25l");
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
    }

    process.stdin.on("data", (chunk: Buffer) => this.handleKey(chunk));
    process.stdout.on("resize", () => {
      this.rerenderViewer();
      this.draw();
    });
    process.on("SIGINT", () => {
      this.cleanup();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      this.cleanup();
      process.exit(0);
    });

    this.rerenderViewer();
    this.draw();
  }
}
