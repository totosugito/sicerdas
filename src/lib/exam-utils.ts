import { evaluate } from "mathjs";

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

      // Replace in text content
      if (newItem.content && Array.isArray(newItem.content)) {
        newItem.content = newItem.content.map((textItem: any) => {
          if (textItem.type === "text" && textItem.text) {
            let newText = textItem.text;
            Object.entries(variables).forEach(([key, value]) => {
              const placeholder = `{{${key}}}`;
              newText = newText.split(placeholder).join(String(value));
            });
            return { ...textItem, text: newText };
          }
          return textItem;
        });
      }

      // Replace in specific block types (like math/equation)
      if (newItem.type === "math" && newItem.props?.equation) {
        let newEquation = newItem.props.equation;
        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          newEquation = newEquation.split(placeholder).join(String(value));
        });
        newItem.props = { ...newItem.props, equation: newEquation };
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

  // Create a combined scope for mathjs
  const scope = { ...variables };

  Object.entries(formulas).forEach(([key, formula]) => {
    try {
      // Evaluate within the current scope
      const result = evaluate(formula, scope);
      results[key] = result;
      // Update scope so subsequent formulas can use this result
      scope[key] = result;
    } catch (e) {
      console.error(`Error evaluating formula for ${key}: ${formula}`, e);
      results[key] = `[Error: ${formula}]`;
    }
  });

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
