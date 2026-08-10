import fs from "fs";
import path from "path";

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

// Recursively scan OS filesystem directory for dev preview server & Tauri desktop app
export function scanFsDirectory(dirPath: string): FileNode[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const item of items) {
      // Ignore hidden files and node_modules
      if (item.name.startsWith(".") || item.name === "node_modules") continue;

      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        const children = scanFsDirectory(fullPath);
        nodes.push({
          name: item.name,
          path: fullPath,
          isDirectory: true,
          children,
        });
      } else {
        nodes.push({
          name: item.name,
          path: fullPath,
          isDirectory: false,
        });
      }
    }

    return nodes.sort((a, b) => (b.isDirectory ? 1 : 0) - (a.isDirectory ? 1 : 0) || a.name.localeCompare(b.name));
  } catch (err) {
    console.error("Error scanning FS directory:", err);
    return [];
  }
}
