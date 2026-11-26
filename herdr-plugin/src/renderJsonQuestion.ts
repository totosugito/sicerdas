import { ANSI, wrapText } from "./ansi";
import { latexToUnicode } from "./mathUnicode";
import { evaluateSolutionFormulas, injectVariables } from "./variableUtils";
import { RenderResult } from "./renderMarkdown";

function renderInlineNodes(nodes: any[], scope: Record<string, any> | null): string {
  if (!Array.isArray(nodes)) return "";
  let out = "";
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    if (node.type === "text") {
      let txt = String(node.text ?? "");
      if (scope) txt = injectVariables(txt, scope);
      const styles = node.styles || {};
      if (styles.bold) txt = `${ANSI.bold}${txt}${ANSI.reset}`;
      if (styles.italic) txt = `${ANSI.italic}${txt}${ANSI.reset}`;
      if (styles.code) txt = `${ANSI.yellow}${txt}${ANSI.reset}`;
      out += txt;
    } else if (node.type === "math") {
      let expr = Array.isArray(node.content)
        ? node.content.map((c: any) => c?.text ?? "").join("")
        : String(node.props?.latex ?? node.text ?? "");
      if (scope) expr = injectVariables(expr, scope);
      out += `${ANSI.brightCyan}${latexToUnicode(expr)}${ANSI.reset}`;
    } else if (Array.isArray(node.content)) {
      out += renderInlineNodes(node.content, scope);
    }
  }
  return out;
}

function renderBlocks(
  blocks: any[],
  scope: Record<string, any> | null,
  width: number,
  indent = "",
): string[] {
  if (!Array.isArray(blocks)) return [];
  const lines: string[] = [];
  let numberedIdx = 1;

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const type = block.type;
    if (type !== "numberedListItem") numberedIdx = 1;

    if (type === "paragraph") {
      const text = renderInlineNodes(block.content, scope);
      if (text.trim()) {
        lines.push(...wrapText(`${indent}${text}`, width));
      } else {
        lines.push("");
      }
    } else if (type === "heading") {
      const level = block.props?.level ?? 2;
      const prefix = level <= 2 ? "▌ " : "• ";
      const text = renderInlineNodes(block.content, scope);
      lines.push("");
      lines.push(
        ...wrapText(`${indent}${ANSI.bold}${ANSI.cyan}${prefix}${text}${ANSI.reset}`, width),
      );
    } else if (type === "bulletListItem") {
      const text = renderInlineNodes(block.content, scope);
      lines.push(...wrapText(`${indent}  • ${text}`, width));
    } else if (type === "numberedListItem") {
      const text = renderInlineNodes(block.content, scope);
      lines.push(...wrapText(`${indent}  ${numberedIdx++}. ${text}`, width));
    } else if (type === "alert") {
      const alertType = block.props?.type ?? "info";
      const text = renderInlineNodes(block.content, scope);
      lines.push(
        ...wrapText(`${indent}${ANSI.yellow}│ [${alertType}] ${text}${ANSI.reset}`, width),
      );
    } else if (type === "mathBlock") {
      let expr = String(block.props?.latex ?? "");
      if (!expr && Array.isArray(block.content)) {
        expr = block.content.map((c: any) => c?.text ?? "").join("");
      }
      if (scope) expr = injectVariables(expr, scope);
      const unicode = latexToUnicode(expr);
      for (const ml of unicode.split("\n")) {
        if (ml.trim()) lines.push(`${indent}  ${ANSI.brightCyan}${ml}${ANSI.reset}`);
      }
    } else if (type === "image") {
      const url = block.props?.url ?? "";
      const caption = block.props?.caption ?? "";
      lines.push(
        `${indent}${ANSI.magenta}[Image: ${url}${caption ? ` — ${caption}` : ""}]${ANSI.reset}`,
      );
    } else if (type === "codeBlock") {
      const code = Array.isArray(block.content)
        ? block.content.map((c: any) => c?.text ?? "").join("")
        : "";
      for (const cl of code.split("\n")) {
        lines.push(`${indent}  ${ANSI.yellow}${cl}${ANSI.reset}`);
      }
    } else if (Array.isArray(block.content)) {
      const text = renderInlineNodes(block.content, scope);
      if (text.trim()) lines.push(...wrapText(`${indent}${text}`, width));
    }

    if (Array.isArray(block.children) && block.children.length > 0) {
      lines.push(...renderBlocks(block.children, scope, width, indent + "  "));
    }
  }

  return lines;
}

export function renderJsonContent(
  rawContent: string,
  width: number,
  variationIndex: number | "raw",
): RenderResult {
  let data: any;
  try {
    data = JSON.parse(rawContent);
  } catch (err: any) {
    return {
      lines: [`${ANSI.red}Invalid JSON: ${err?.message ?? err}${ANSI.reset}`],
      variableSetsCount: 0,
      hasVariables: false,
      activeScope: null,
    };
  }

  const questions = Array.isArray(data) ? data : [data];
  const isExamQuestion = questions.some(
    (q) => q && typeof q === "object" && (Array.isArray(q.content) || Array.isArray(q.options)),
  );

  // Fallback for non-exam JSON (e.g. *_spec.json)
  if (!isExamQuestion) {
    const pretty = JSON.stringify(data, null, 2).split("\n");
    return {
      lines: pretty.map((l) => `${ANSI.cyan}${l}${ANSI.reset}`),
      variableSetsCount: 0,
      hasVariables: false,
      activeScope: null,
    };
  }

  const wrapW = Math.max(20, width - 2);
  const lines: string[] = [];
  let maxVarsCount = 0;
  let firstActiveScope: Record<string, any> | null = null;

  questions.forEach((q, qIdx) => {
    if (questions.length > 1) {
      lines.push(`${ANSI.bold}${ANSI.brightMagenta}═══ Soal #${qIdx + 1} ═══${ANSI.reset}`);
    }

    const vf = q.variableFormulas;
    const varSets: Record<string, any>[] = Array.isArray(vf?.variables) ? vf.variables : [];
    if (varSets.length > maxVarsCount) maxVarsCount = varSets.length;

    let scope: Record<string, any> | null = null;
    if (variationIndex !== "raw" && varSets.length > 0 && varSets[variationIndex]) {
      scope = evaluateSolutionFormulas(vf?.solutions, varSets[variationIndex]);
      if (!firstActiveScope) firstActiveScope = scope;
    }

    // Metadata line
    const meta: string[] = [];
    if (q.type) meta.push(`${ANSI.cyan}${q.type}${ANSI.reset}`);
    if (q.difficulty) meta.push(`${ANSI.yellow}${q.difficulty}${ANSI.reset}`);
    if (Array.isArray(q.tags) && q.tags.length > 0) {
      meta.push(`${ANSI.gray}[${q.tags.join(", ")}]${ANSI.reset}`);
    }
    if (meta.length > 0) lines.push(...wrapText(meta.join("  •  "), wrapW));

    if (varSets.length > 0) {
      const varLabel =
        variationIndex === "raw"
          ? `${ANSI.inverse} Template {{var}} ${ANSI.reset}`
          : `${ANSI.bgBlue}${ANSI.white} Set #${variationIndex + 1}/${varSets.length} ${ANSI.reset}`;
      lines.push(`${ANSI.bold}Variations:${ANSI.reset} ${varLabel}`);
    }
    lines.push(`${ANSI.gray}${"─".repeat(Math.min(wrapW, 60))}${ANSI.reset}`);

    // Question Content
    lines.push(`${ANSI.bold}${ANSI.cyan}▌ Soal${ANSI.reset}`);
    lines.push(...renderBlocks(q.content, scope, wrapW));

    // Options
    if (Array.isArray(q.options) && q.options.length > 0) {
      lines.push("");
      lines.push(`${ANSI.bold}${ANSI.cyan}▌ Opsi${ANSI.reset}`);
      q.options.forEach((opt: any, idx: number) => {
        const letter = String.fromCharCode(65 + idx);
        const mark = opt.isCorrect
          ? `${ANSI.brightGreen}[✓] ${letter}.${ANSI.reset}`
          : `${ANSI.gray}[ ]${ANSI.reset} ${letter}.`;
        const optLines = renderBlocks(opt.content, scope, wrapW - 8);
        if (optLines.length === 0) {
          lines.push(`  ${mark}`);
        } else {
          lines.push(`  ${mark} ${optLines[0]}`);
          for (let k = 1; k < optLines.length; k++) {
            lines.push(`         ${optLines[k]}`);
          }
        }
      });
    }

    // Reason Content
    if (Array.isArray(q.reasonContent) && q.reasonContent.length > 0) {
      lines.push("");
      lines.push(`${ANSI.bold}${ANSI.cyan}▌ Alasan / Petunjuk${ANSI.reset}`);
      lines.push(...renderBlocks(q.reasonContent, scope, wrapW));
    }

    // Solutions
    if (Array.isArray(q.solutions) && q.solutions.length > 0) {
      q.solutions.forEach((sol: any, sIdx: number) => {
        lines.push("");
        const title = sol.title || `Pembahasan #${sIdx + 1}`;
        lines.push(`${ANSI.bold}${ANSI.cyan}▌ ${title}${ANSI.reset}`);
        lines.push(...renderBlocks(sol.content, scope, wrapW));
      });
    }

    lines.push("");
  });

  return {
    lines,
    variableSetsCount: maxVarsCount,
    hasVariables: maxVarsCount > 0,
    activeScope: firstActiveScope,
  };
}
