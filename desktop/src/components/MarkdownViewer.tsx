import React, { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { schema } from "@/components/custom/blocknote/lib/blocknote-config";
import { BlockNoteStatic } from "@/components/custom/blocknote";
import { getStorageService } from "../services/fileStorageService";

interface MarkdownViewerProps {
  content: string;
  filePath?: string;
  className?: string;
}

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\s*/, "");
}

/**
 * Convert KaTeX markdown delimiters into HTML elements that BlockNote's
 * ProseMirror schema can parse into equation/latex blocks.
 *
 * Block-level:  $$...$$  →  <div data-type="equation" data-latex="..."></div>
 * Inline:       $...$    →  <span data-type="latex" data-latex="..."></span>
 *
 * BlockNote's markdown parser (`markdownToHTML`) has no KaTeX support,
 * so this preprocessing is required for math to render.
 */
function convertKatexToHtmlElements(markdown: string): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Block math: line that is exactly $$
    if (trimmed === "$$") {
      const mathLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "$$") {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing $$
      const latex = mathLines.join("\n");
      result.push(`<div data-type="equation" data-latex="${latex}"></div>`);
      result.push("");
      continue;
    }

    // Inline math: $...$ (not $$)
    // Process line character by character to handle multiple $ delimiters
    let out = "";
    let j = 0;
    while (j < line.length) {
      if (line[j] === "$" && (j + 1 >= line.length || line[j + 1] !== "$")) {
        // Found opening $
        let k = j + 1;
        while (k < line.length && line[k] !== "$") k++;
        if (k < line.length && k > j + 1) {
          const latex = line.slice(j + 1, k);
          out += `<span data-type="latex" data-latex="${latex}"></span>`;
          j = k + 1;
        } else {
          out += line[j];
          j++;
        }
      } else {
        out += line[j];
        j++;
      }
    }
    result.push(out);
    i++;
  }

  return result.join("\n");
}

/**
 * Find all relative image src values in the markdown (HTML img tags) and
 * return them with their absolute resolved paths.
 */
function extractRelativeImages(markdown: string, mdFilePath: string): { original: string; resolved: string }[] {
  const dir = mdFilePath.substring(0, mdFilePath.lastIndexOf("/"));
  const images: { original: string; resolved: string }[] = [];
  const seen = new Set<string>();
  const regex = /<img\s+[^>]*src=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const src = match[1];
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) continue;
    if (seen.has(src)) continue;
    seen.add(src);
    const resolved = `${dir}/${src}`.replace(/\/+/g, "/");
    images.push({ original: src, resolved });
  }
  return images;
}

export function MarkdownViewer({ content, filePath, className }: MarkdownViewerProps) {
  const [blocks, setBlocks] = useState<any[] | null>(null);

  const editor = useCreateBlockNote({ schema });

  useEffect(() => {
    const parse = async () => {
      const raw = stripFrontmatter(content);

      // Load relative images as data URLs so BlockNote can display them
      let preprocessed = raw;
      if (filePath) {
        const images = extractRelativeImages(raw, filePath);
        if (images.length > 0) {
          const storageService = getStorageService();
          for (const img of images) {
            try {
              const dataUrl = await storageService.readImageFile(img.resolved);
              preprocessed = preprocessed.replaceAll(img.original, dataUrl);
            } catch (err) {
              console.warn(`Failed to load image: ${img.resolved}`, err);
            }
          }
        }
      }

      preprocessed = convertKatexToHtmlElements(preprocessed);

      try {
        const parsed = editor.tryParseMarkdownToBlocks(preprocessed);
        setBlocks(parsed);
      } catch (err) {
        console.error("Failed to parse markdown to blocks:", err);
        setBlocks(null);
      }
    };

    parse();
  }, [content, filePath, editor]);

  if (blocks === null) {
    return (
      <div className="p-4 text-sm text-muted-foreground border rounded bg-muted/20">
        Failed to render markdown preview.
      </div>
    );
  }

  return <BlockNoteStatic content={blocks} className={className} />;
}
