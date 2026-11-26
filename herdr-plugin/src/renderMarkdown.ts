import path from "path";
import { ANSI, wrapText } from "./ansi";
import { latexToUnicode } from "./mathUnicode";
import {
  parseMarkdownFrontmatter,
  evaluateSolutionFormulas,
  injectVariables,
} from "./variableUtils";

export interface RenderResult {
  lines: string[];
  variableSetsCount: number;
  hasVariables: boolean;
  activeScope: Record<string, any> | null;
}

function formatInlineMarkdown(text: string): string {
  // Replace inline $...$ math first
  let out = text.replace(/\$([^$\n]+?)\$/g, (_, expr) => {
    return `${ANSI.brightCyan}${latexToUnicode(expr)}${ANSI.reset}`;
  });
  // Bold **...**
  out = out.replace(/\*\*([^*]+?)\*\*/g, `${ANSI.bold}$1${ANSI.reset}`);
  // Inline code `...`
  out = out.replace(/`([^`]+?)`/g, `${ANSI.yellow}$1${ANSI.reset}`);
  // Markdown images ![alt](src)
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `${ANSI.magenta}[Image: ${alt || path.basename(src)} (${src})]${ANSI.reset}`;
  });
  return out;
}

export function renderMarkdownContent(
  rawContent: string,
  width: number,
  variationIndex: number | "raw",
): RenderResult {
  const parsed = parseMarkdownFrontmatter(rawContent);
  const variableSets = parsed.variableFormulas?.variables || [];

  let activeScope: Record<string, any> | null = null;
  let body = parsed.body;

  if (variationIndex !== "raw" && parsed.hasVariables && variableSets[variationIndex]) {
    activeScope = evaluateSolutionFormulas(
      parsed.variableFormulas?.solutions,
      variableSets[variationIndex],
    );
    body = injectVariables(body, activeScope);
  }

  const lines: string[] = [];
  const wrapW = Math.max(20, width - 2);

  // Header metadata bar from frontmatter
  if (parsed.frontmatter) {
    const fm = parsed.frontmatter;
    const badges: string[] = [];
    if (fm.type) badges.push(`${ANSI.cyan}${fm.type}${ANSI.reset}`);
    if (fm.difficulty) badges.push(`${ANSI.yellow}${fm.difficulty}${ANSI.reset}`);
    if (Array.isArray(fm.tags) && fm.tags.length > 0) {
      badges.push(`${ANSI.gray}[${fm.tags.join(", ")}]${ANSI.reset}`);
    }
    if (badges.length > 0) {
      lines.push(...wrapText(badges.join("  •  "), wrapW));
    }
  }

  // Variable variation bar
  if (parsed.hasVariables) {
    const varLabel =
      variationIndex === "raw"
        ? `${ANSI.inverse} Template {{var}} ${ANSI.reset}`
        : `${ANSI.bgBlue}${ANSI.white} Set #${variationIndex + 1}/${variableSets.length} ${ANSI.reset}`;
    const scopePreview = activeScope
      ? "  " +
        Object.entries(activeScope)
          .slice(0, 5)
          .map(
            ([k, v]) =>
              `${ANSI.gray}${k}=${ANSI.reset}${ANSI.green}${latexToUnicode(String(v))}${ANSI.reset}`,
          )
          .join(" ")
      : "";
    lines.push(`${ANSI.bold}Variations:${ANSI.reset} ${varLabel}${scopePreview}`);
    lines.push(`${ANSI.gray}${"─".repeat(Math.min(wrapW, 60))}${ANSI.reset}`);
  }

  // Process body line-by-line, handling $$...$$ math blocks and ``` code blocks
  const rawLines = body.split(/\r?\n/);
  let inBlockMath = false;
  let mathBuffer: string[] = [];
  let inCodeBlock = false;

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      lines.push(`${ANSI.gray}${trimmed}${ANSI.reset}`);
      continue;
    }
    if (inCodeBlock) {
      lines.push(`${ANSI.yellow}  ${rawLine}${ANSI.reset}`);
      continue;
    }

    // Single-line $$ ... $$
    if (!inBlockMath && trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4) {
      const inner = trimmed.slice(2, -2);
      const unicode = latexToUnicode(inner);
      for (const ml of unicode.split("\n")) {
        lines.push(`  ${ANSI.brightCyan}${ml}${ANSI.reset}`);
      }
      continue;
    }

    // Multi-line $$ block start/end
    if (trimmed.startsWith("$$")) {
      if (!inBlockMath) {
        inBlockMath = true;
        mathBuffer = [trimmed.slice(2)];
      } else {
        mathBuffer.push(trimmed.slice(0, -2));
        inBlockMath = false;
        const unicode = latexToUnicode(mathBuffer.join("\n"));
        for (const ml of unicode.split("\n")) {
          if (ml.trim()) lines.push(`  ${ANSI.brightCyan}${ml}${ANSI.reset}`);
        }
        mathBuffer = [];
      }
      continue;
    }
    if (inBlockMath) {
      if (trimmed.endsWith("$$")) {
        mathBuffer.push(trimmed.slice(0, -2));
        inBlockMath = false;
        const unicode = latexToUnicode(mathBuffer.join("\n"));
        for (const ml of unicode.split("\n")) {
          if (ml.trim()) lines.push(`  ${ANSI.brightCyan}${ml}${ANSI.reset}`);
        }
        mathBuffer = [];
      } else {
        mathBuffer.push(rawLine);
      }
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      lines.push("");
      lines.push(
        `${ANSI.bold}${ANSI.brightCyan}${formatInlineMarkdown(trimmed.slice(2))}${ANSI.reset}`,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      lines.push("");
      lines.push(
        `${ANSI.bold}${ANSI.cyan}▌ ${formatInlineMarkdown(trimmed.slice(3))}${ANSI.reset}`,
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      lines.push("");
      lines.push(`${ANSI.bold}${ANSI.blue}${formatInlineMarkdown(trimmed.slice(4))}${ANSI.reset}`);
      continue;
    }

    // Checkboxes (- [ ] / - [x])
    if (trimmed.startsWith("- [x] ") || trimmed.startsWith("- [X] ")) {
      const content = formatInlineMarkdown(trimmed.slice(6));
      lines.push(...wrapText(`  ${ANSI.brightGreen}[✓] ${content}${ANSI.reset}`, wrapW));
      continue;
    }
    if (trimmed.startsWith("- [ ] ")) {
      const content = formatInlineMarkdown(trimmed.slice(6));
      lines.push(...wrapText(`  ${ANSI.gray}[ ]${ANSI.reset} ${content}`, wrapW));
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith("> ")) {
      const content = formatInlineMarkdown(trimmed.slice(2));
      lines.push(...wrapText(`${ANSI.yellow}│ ${content}${ANSI.reset}`, wrapW));
      continue;
    }

    // Normal paragraph / list line
    if (!trimmed) {
      lines.push("");
    } else {
      lines.push(...wrapText(formatInlineMarkdown(rawLine), wrapW));
    }
  }

  return {
    lines,
    variableSetsCount: variableSets.length,
    hasVariables: parsed.hasVariables,
    activeScope,
  };
}
