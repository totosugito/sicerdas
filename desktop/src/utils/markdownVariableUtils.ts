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

/**
 * Extracts YAML frontmatter and body from raw markdown content
 */
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
    const solutions = typeof vf?.solutions === "object" && vf.solutions !== null ? vf.solutions : undefined;

    return {
      frontmatter,
      body,
      variableFormulas: vf ? { variables, solutions } : null,
      hasVariables: variables.length > 0,
      variableSetsCount: variables.length,
    };
  } catch (e) {
    console.warn("Failed to parse YAML frontmatter:", e);
    return {
      frontmatter: null,
      body: rawContent,
      variableFormulas: null,
      hasVariables: false,
      variableSetsCount: 0,
    };
  }
}

/**
 * Evaluates solution formulas based on a chosen variable set scope using mathjs
 */
export function evaluateSolutionFormulas(
  formulas: Record<string, string> | undefined,
  variableSet: Record<string, any>
): Record<string, any> {
  if (!formulas) return { ...variableSet };

  const scope: Record<string, any> = { ...variableSet };

  Object.entries(formulas).forEach(([key, formula]) => {
    try {
      let result = evaluate(formula, scope);
      if (typeof result === "number") {
        result = Number(result.toPrecision(12));
      }
      scope[key] = result;
    } catch (e) {
      console.warn(`Error evaluating formula for ${key}: ${formula}`, e);
      scope[key] = `[Error: ${formula}]`;
    }
  });

  return scope;
}

/**
 * Injects variable and evaluated solution values into {{placeholder}} in markdown text
 */
export function injectVariablesIntoMarkdown(
  markdown: string,
  variables: Record<string, any>
): string {
  let result = markdown;
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(String(value));
  });
  return result;
}
