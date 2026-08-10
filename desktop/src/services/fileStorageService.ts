import { open } from "@tauri-apps/plugin-dialog";
import { readDir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { homeDir } from "@tauri-apps/api/path";

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
}

export interface FileStorageService {
  selectDirectory(): Promise<string | null>;
  getHomeDir(): Promise<string>;
  readDirectoryTree(dirPath: string): Promise<FileNode[]>;
  readJsonFile(filePath: string): Promise<string>;
  writeJsonFile(filePath: string, content: string): Promise<void>;
}

// Detect if app is executing inside compiled Tauri binary window vs browser dev server
export const isTauriEnvironment = () => {
  return typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI_IPC__" in window);
};

// 1. Native Tauri Storage Service (Used when built or launched in Tauri native window)
export class TauriNativeStorageService implements FileStorageService {
  async selectDirectory(): Promise<string | null> {
    const home = await this.getHomeDir();
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: home,
      });
      if (typeof selected === "string") return selected;
      return null;
    } catch (err) {
      console.warn("Native folder dialog fallback:", err);
      return home;
    }
  }

  async getHomeDir(): Promise<string> {
    try {
      return await homeDir();
    } catch (err) {
      console.warn("Failed to get home directory:", err);
      return "/";
    }
  }

  async readDirectoryTree(dirPath: string): Promise<FileNode[]> {
    try {
      const entries = await readDir(dirPath);
      const nodes: FileNode[] = [];

      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

        const fullPath = `${dirPath.replace(/\/$/, "")}/${entry.name}`;
        if (entry.isDirectory) {
          const children = await this.readDirectoryTree(fullPath);
          nodes.push({
            name: entry.name,
            path: fullPath,
            isDirectory: true,
            children,
          });
        } else {
          nodes.push({
            name: entry.name,
            path: fullPath,
            isDirectory: false,
          });
        }
      }

      return nodes.sort((a, b) => (b.isDirectory ? 1 : 0) - (a.isDirectory ? 1 : 0) || a.name.localeCompare(b.name));
    } catch (err) {
      console.error("Failed to read directory tree via Tauri FS API:", err);
      return [];
    }
  }

  async readJsonFile(filePath: string): Promise<string> {
    return await readTextFile(filePath);
  }

  async writeJsonFile(filePath: string, content: string): Promise<void> {
    await writeTextFile(filePath, content);
  }
}

// 2. Dev Web Storage Service (Exposes real local OS directory tree via Vite dev middleware when viewing in browser preview)
export class DevWebFsStorageService implements FileStorageService {
  async selectDirectory(): Promise<string | null> {
    const home = await this.getHomeDir();
    const inputPath = window.prompt("Enter OS Directory Path to Open:", home);
    return inputPath || home;
  }

  async getHomeDir(): Promise<string> {
    try {
      const res = await fetch("/api/fs/home");
      if (res.ok) {
        return await res.text();
      }
    } catch (err) {
      console.warn("Failed to get home directory from dev API:", err);
    }
    return "/";
  }

  async readDirectoryTree(dirPath: string): Promise<FileNode[]> {
    try {
      const res = await fetch(`/api/fs/tree?path=${encodeURIComponent(dirPath)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Failed to read FS tree from dev API:", err);
    }
    return [];
  }

  async readJsonFile(filePath: string): Promise<string> {
    const res = await fetch(`/api/fs/read?path=${encodeURIComponent(filePath)}`);
    if (res.ok) {
      return await res.text();
    }
    throw new Error(`Could not read file at ${filePath}`);
  }

  async writeJsonFile(filePath: string, content: string): Promise<void> {
    await fetch(`/api/fs/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath, content }),
    });
  }
}

// Instantiate storage service automatically based on runtime environment
export const getStorageService = (): FileStorageService => {
  if (isTauriEnvironment()) {
    return new TauriNativeStorageService();
  }
  return new DevWebFsStorageService();
};
