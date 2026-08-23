import { evaluate } from "mathjs";

/**
 * Parses a text string containing $math$ and **bold** into an array of text and latex inline nodes.
 */
function parseTextToInlineNodes(text: string, baseStyles: any = {}): any[] {
  // Match groups:
  // 1: $$math$$
  // 2: $math$
  // 3: **bold**
  const regex = /\$\$([\s\S]+?)\$\$|\$((?!\$)[\s\S]+?)\$|\*\*([\s\S]+?)\*\*/g;
  let match;
  let lastIndex = 0;
  const result: any[] = [];

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        text: text.substring(lastIndex, match.index),
        styles: baseStyles,
      });
    }

    if (match[1] || match[2]) {
      // Math node
      const latex = match[1] || match[2];
      result.push({
        type: "latex",
        props: {
          latex: latex,
          displayMode: !!match[1],
        },
      });
    } else if (match[3]) {
      // Bold text node
      result.push({
        type: "text",
        text: match[3],
        styles: { ...baseStyles, bold: true },
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({
      type: "text",
      text: text.substring(lastIndex),
      styles: baseStyles,
    });
  }

  return result.length > 0 ? result : [{ type: "text", text: text, styles: baseStyles }];
}

/**
 * Recursively injects variables into a BlockNote JSON structure.
 * It replaces {{key}} placeholders in text and equation properties.
 */
export function injectVariablesIntoBlocks(
  blocks: any[] | null | undefined,
  variables: Record<string, string | number>,
): any[] {
  if (!blocks || !Array.isArray(blocks)) return [];

  const traverse = (items: any[]): any[] => {
    return items.map((item) => {
      const newItem = { ...item };

      // Replace in text content / inline latex
      if (newItem.content && Array.isArray(newItem.content)) {
        newItem.content = newItem.content.flatMap((inlineItem: any) => {
          if (inlineItem.type === "text" && inlineItem.text) {
            let newText = inlineItem.text;
            let hasReplacement = false;
            Object.entries(variables).forEach(([key, value]) => {
              const placeholder = `{{${key}}}`;
              if (newText.includes(placeholder)) {
                newText = newText.split(placeholder).join(String(value));
                hasReplacement = true;
              }
            });
            
            // If we replaced a variable and the new text contains math or bold syntax, parse it
            if (hasReplacement && (newText.includes("$") || newText.includes("**"))) {
              return parseTextToInlineNodes(newText, inlineItem.styles);
            }
            
            return { ...inlineItem, text: newText };
          }
          if (inlineItem.type === "latex" && inlineItem.props?.latex) {
            let newLatex = inlineItem.props.latex;
            Object.entries(variables).forEach(([key, value]) => {
              const placeholder = `{{${key}}}`;
              newLatex = newLatex.split(placeholder).join(String(value));
            });
            return { ...inlineItem, props: { ...inlineItem.props, latex: newLatex } };
          }
          return inlineItem;
        });
      }

      // Replace in specific block types (like equation)
      if (newItem.type === "equation" && newItem.props?.latex) {
        let newLatex = newItem.props.latex;
        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          newLatex = newLatex.split(placeholder).join(String(value));
        });
        newItem.props = { ...newItem.props, latex: newLatex };
      }

      // Replace in image blocks (url and caption)
      if (newItem.type === "image" && newItem.props?.url) {
        let newUrl = newItem.props.url;
        let newCaption = newItem.props.caption || "";
        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          newUrl = newUrl.split(placeholder).join(String(value));
          newCaption = newCaption.split(placeholder).join(String(value));
        });
        
        if (newUrl.startsWith("../")) {
          newUrl = `./${newUrl}`;
        }
        
        newItem.props = { ...newItem.props, url: newUrl, caption: newCaption };
      }

      // Recurse into children
      if (newItem.children && Array.isArray(newItem.children)) {
        newItem.children = traverse(newItem.children);
      }

      return newItem;
    });
  };

  return JSON.parse(JSON.stringify(traverse(blocks))); // Deep clone return
}

/**
 * Evaluates formulas using mathjs and a scope of variables.
 */
export function evaluateFormulas(
  formulas: Record<string, string> | null | undefined,
  variables: Record<string, string | number>,
): Record<string, string | number> {
  if (!formulas) return {};

  const results: Record<string, string | number> = {};
  const scope: Record<string, any> = { ...variables };
  const entries = Object.entries(formulas);
  const remaining = new Map<string, string>(entries);

  // Multi-pass resolution for dependency chains regardless of key order
  let maxPasses = remaining.size;
  while (remaining.size > 0 && maxPasses > 0) {
    let resolvedAny = false;
    for (const [key, formula] of Array.from(remaining.entries())) {
      try {
        let result = evaluate(formula, scope);
        if (typeof result === "number") {
          result = Number(result.toPrecision(12));
        }
        results[key] = result;
        scope[key] = result;
        remaining.delete(key);
        resolvedAny = true;
      } catch {
        // Retry in next pass if dependencies are not yet evaluated
      }
    }
    if (!resolvedAny) break;
    maxPasses--;
  }

  // Handle any genuine evaluation errors
  if (remaining.size > 0) {
    remaining.forEach((formula, key) => {
      console.error(`Error evaluating formula for ${key}: ${formula}`);
      results[key] = `[Error: ${formula}]`;
    });
  }

  return results;
}

/**
 * Returns a Tailwind background color class based on the grade name.
 */
export function getGradeColor(gradeName: string | null): string {
  if (!gradeName) return "bg-slate-500";
  const name = gradeName.toLowerCase();

  // SMA / High School
  if (name.includes("sma") || name.includes("10") || name.includes("11") || name.includes("12")) {
    return "bg-blue-600";
  }

  // SMP / Junior High
  if (name.includes("smp") || name.includes("7") || name.includes("8") || name.includes("9")) {
    return "bg-emerald-600";
  }

  // SD / Elementary
  if (
    name.includes("sd") ||
    name.includes("1") ||
    name.includes("2") ||
    name.includes("3") ||
    name.includes("4") ||
    name.includes("5") ||
    name.includes("6")
  ) {
    return "bg-orange-600";
  }

  return "bg-slate-600";
}
