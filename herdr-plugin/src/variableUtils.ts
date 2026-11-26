import * as yaml from "js-yaml";
import { evaluate } from "mathjs";

export interface VariableFormulasConfig {
  variables?: Record<string, any>[];
  solutions?: Record<string, string>;
}

export interface ParsedMarkdownQuestion {
  frontmatter: Record<string, any> | null;
  body: string;
  variableFormulas: VariableFormulasConfig | null;
  hasVariables: boolean;
  variableSetsCount: number;
}

export function parseMarkdownFrontmatter(rawContent: string): ParsedMarkdownQuestion {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: null,
      body: rawContent,
      variableFormulas: null,
      hasVariables: false,
      variableSetsCount: 0,
    };
  }

  const [, yamlStr, body] = match;
  try {
    const frontmatter = (yaml.load(yamlStr) as Record<string, any>) || {};
    const vf = frontmatter.variableFormulas as VariableFormulasConfig | undefined;
    const variables = Array.isArray(vf?.variables) ? vf.variables : [];
    const solutions =
      typeof vf?.solutions === "object" && vf.solutions !== null ? vf.solutions : undefined;

    return {
      frontmatter,
      body,
      variableFormulas: vf ? { variables, solutions } : null,
      hasVariables: variables.length > 0,
      variableSetsCount: variables.length,
    };
  } catch {
    return {
      frontmatter: null,
      body: rawContent,
      variableFormulas: null,
      hasVariables: false,
      variableSetsCount: 0,
    };
  }
}

export function evaluateSolutionFormulas(
  formulas: Record<string, string> | undefined,
  variableSet: Record<string, any>,
): Record<string, any> {
  if (!formulas) return { ...variableSet };

  const scope: Record<string, any> = { ...variableSet };
  const remaining = new Map<string, string>(Object.entries(formulas));
  let maxPasses = remaining.size;

  while (remaining.size > 0 && maxPasses > 0) {
    let resolvedAny = false;
    for (const [key, formula] of Array.from(remaining.entries())) {
      try {
        let result = evaluate(formula, scope);
        if (typeof result === "number") {
          result = Number(result.toPrecision(12));
        }
        scope[key] = result;
        remaining.delete(key);
        resolvedAny = true;
      } catch {
        // Retry on next pass if dependency wasn't resolved yet
      }
    }
    if (!resolvedAny) break;
    maxPasses--;
  }

  for (const [key, formula] of remaining.entries()) {
    scope[key] = `[Error: ${formula}]`;
  }

  return scope;
}

export function injectVariables(text: string, variables: Record<string, any>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.split(`{{${key}}}`).join(String(value));
  }
  return result;
}
