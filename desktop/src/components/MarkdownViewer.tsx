import React, { useEffect, useState, useMemo } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { getStorageService } from "../services/fileStorageService";
import { useTheme } from "@/lib/theme-provider";
import {
  parseMarkdownFrontmatter,
  evaluateSolutionFormulas,
  injectVariablesIntoMarkdown,
} from "../utils/markdownVariableUtils";
import { SlidersHorizontal, Eye, Variable } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownViewerProps {
  content: string;
  filePath?: string;
  className?: string;
}

/**
 * Find all relative image src values in the markdown (both HTML img tags and Markdown syntax)
 * and return them with their absolute resolved paths.
 */
function extractRelativeImages(
  markdown: string,
  mdFilePath: string
): { original: string; resolved: string }[] {
  const dir = mdFilePath.substring(0, mdFilePath.lastIndexOf("/"));
  const images: { original: string; resolved: string }[] = [];
  const seen = new Set<string>();

  // Match HTML img tags: <img ... src="..." ...>
  const htmlRegex = /<img\s+[^>]*src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = htmlRegex.exec(markdown)) !== null) {
    const src = match[1];
    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:")
    ) {
      continue;
    }
    if (seen.has(src)) continue;
    seen.add(src);
    const resolved = `${dir}/${src}`.replace(/\/+/g, "/");
    images.push({ original: src, resolved });
  }

  // Match Markdown image syntax: ![alt](src)
  const mdRegex = /!\[.*?\]\(([^)\s]+)(?:\s+["'].*?["'])?\)/g;
  while ((match = mdRegex.exec(markdown)) !== null) {
    const src = match[1];
    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:")
    ) {
      continue;
    }
    if (seen.has(src)) continue;
    seen.add(src);
    const resolved = `${dir}/${src}`.replace(/\/+/g, "/");
    images.push({ original: src, resolved });
  }

  return images;
}

export function MarkdownViewer({
  content,
  filePath,
  className,
}: MarkdownViewerProps) {
  const [processedMarkdown, setProcessedMarkdown] = useState<string>("");
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number | "raw">("raw");
  const { theme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Parse frontmatter and variable formulas
  const parsed = useMemo(() => {
    return parseMarkdownFrontmatter(content);
  }, [content]);

  // Reset selected variation index when content or file changes
  useEffect(() => {
    if (parsed.hasVariables) {
      // Default to the first variation set if available, or keep template
      setSelectedVariationIndex(0);
    } else {
      setSelectedVariationIndex("raw");
    }
  }, [filePath, parsed.hasVariables]);

  const activeScope = useMemo(() => {
    if (
      selectedVariationIndex === "raw" ||
      !parsed.variableFormulas?.variables ||
      !parsed.variableFormulas.variables[selectedVariationIndex]
    ) {
      return null;
    }

    const varSet = parsed.variableFormulas.variables[selectedVariationIndex];
    return evaluateSolutionFormulas(parsed.variableFormulas.solutions, varSet);
  }, [parsed, selectedVariationIndex]);

  useEffect(() => {
    let isMounted = true;

    const prepareContent = async () => {
      let md = parsed.body;

      // If a variation set is selected, inject variables into markdown
      if (activeScope) {
        md = injectVariablesIntoMarkdown(md, activeScope);
      }

      if (filePath) {
        const images = extractRelativeImages(md, filePath);
        if (images.length > 0) {
          const storageService = getStorageService();
          for (const img of images) {
            try {
              const dataUrl = await storageService.readImageFile(img.resolved);
              md = md.replaceAll(img.original, dataUrl);
            } catch (err) {
              console.warn(`Failed to load relative image: ${img.resolved}`, err);
            }
          }
        }
      }

      if (isMounted) {
        setProcessedMarkdown(md);
      }
    };

    prepareContent();

    return () => {
      isMounted = false;
    };
  }, [parsed.body, activeScope, filePath]);

  const variableSets = parsed.variableFormulas?.variables || [];

  return (
    <div className={`w-full h-full flex flex-col min-h-0 ${className || ""}`}>
      {/* Variable Variation Control Bar */}
      {parsed.hasVariables && (
        <div className="shrink-0 mb-4 p-3 bg-muted/30 dark:bg-muted/20 border border-border/70 rounded-xl flex flex-col gap-3 text-xs shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Segmented Control Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-background/80 dark:bg-background/40 border rounded-lg">
              <span className="text-muted-foreground font-medium px-2 flex items-center gap-1.5 text-[11px]">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                Variations:
              </span>

              {/* Raw / Template Toggle Button */}
              <button
                type="button"
                onClick={() => setSelectedVariationIndex("raw")}
                className={`h-7 px-3 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer outline-none ${
                  selectedVariationIndex === "raw"
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold ring-1 ring-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title="View with raw placeholder tokens like {{a}}, {{b}}"
              >
                <Eye className="h-3.5 w-3.5 opacity-80" />
                <span>Template</span>
              </button>

              <div className="h-4 w-px bg-border/80 mx-0.5" />

              {/* Set #1, #2, ... Toggle Buttons */}
              {variableSets.map((vSet, idx) => {
                const isSelected = selectedVariationIndex === idx;
                const keys = Object.keys(vSet).slice(0, 3);
                const previewStr = keys.map((k) => `${k}=${vSet[k]}`).join(", ");

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariationIndex(idx)}
                    className={`h-7 px-3 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer outline-none ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold ring-1 ring-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    title={`Set #${idx + 1}: ${previewStr}`}
                  >
                    <span>Set #{idx + 1}</span>
                    <span
                      className={`text-[10px] font-normal font-mono ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.2 rounded"
                          : "text-muted-foreground/80"
                      }`}
                    >
                      {previewStr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Variable & Formula Chips */}
          {activeScope && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 font-medium text-[11px] mr-1">
                <Variable className="h-3.5 w-3.5 text-primary" />
                Scope Values:
              </span>
              {Object.entries(activeScope).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-background/90 dark:bg-card border border-border text-[11px] font-mono text-foreground shadow-2xs transition-colors hover:border-primary/40"
                  title={`${k} = ${v}`}
                >
                  <span className="text-primary font-semibold">{k}</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="font-medium text-foreground">{String(v)}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Markdown Preview */}
      <div className="flex-1 overflow-auto">
        <MarkdownPreview
          source={processedMarkdown}
          wrapperElement={{
            "data-color-mode": isDark ? "dark" : "light",
          }}
          remarkPlugins={[remarkMath]}
          rehypePlugins={[
            [
              rehypeKatex,
              {
                output: "html",
                strict: false,
                throwOnError: false,
              },
            ],
          ]}
          style={{
            backgroundColor: "transparent",
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
}

