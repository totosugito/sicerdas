import fs from "fs";
import path from "path";

export interface TreeItem {
  name: string;
  path: string;
  isDirectory: boolean;
  depth: number;
  expanded: boolean;
}

const IGNORED = new Set(["node_modules", ".git", "dist", "target", ".next", ".turbo"]);

export function readDirEntries(
  dirPath: string,
): { name: string; path: string; isDirectory: boolean }[] {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => !IGNORED.has(e.name) && !e.name.startsWith("."))
      .map((e) => ({
        name: e.name,
        path: path.join(dirPath, e.name),
        isDirectory: e.isDirectory(),
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      });
  } catch {
    return [];
  }
}

export function buildVisibleTree(
  rootDir: string,
  expandedDirs: Set<string>,
  depth = 0,
): TreeItem[] {
  const items: TreeItem[] = [];
  const entries = readDirEntries(rootDir);

  for (const entry of entries) {
    const expanded = entry.isDirectory && expandedDirs.has(entry.path);
    items.push({
      name: entry.name,
      path: entry.path,
      isDirectory: entry.isDirectory,
      depth,
      expanded,
    });
    if (expanded) {
      items.push(...buildVisibleTree(entry.path, expandedDirs, depth + 1));
    }
  }

  return items;
}
