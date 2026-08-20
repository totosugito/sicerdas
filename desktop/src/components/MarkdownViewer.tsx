import React, { useEffect, useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { getStorageService } from "../services/fileStorageService";
import { useTheme } from "@/lib/theme-provider";

interface MarkdownViewerProps {
  content: string;
  filePath?: string;
  className?: string;
}

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\s*/, "");
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
  const { theme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    let isMounted = true;

    const prepareContent = async () => {
      const raw = stripFrontmatter(content);
      let md = raw;

      if (filePath) {
        const images = extractRelativeImages(raw, filePath);
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
  }, [content, filePath]);

  return (
    <div
      className={`w-full h-full overflow-auto p-6 transition-colors ${
        className || ""
      }`}
    >
      <MarkdownPreview
        source={processedMarkdown}
        wrapperElement={{
          "data-color-mode": isDark ? "dark" : "light",
        }}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        style={{
          backgroundColor: "transparent",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}
