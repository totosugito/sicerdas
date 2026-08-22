import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import os from "os";
import path from "path";
import { scanFsDirectory } from "./src/services/fsScanner.ts";

// Dev plugin to expose local OS filesystem API when running in Vite dev server browser
function devFsApiPlugin() {
  return {
    name: "dev-fs-api",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
        if (url.pathname === "/api/fs/home") {
          res.setHeader("Content-Type", "text/plain");
          res.end(os.homedir());
          return;
        }
        if (url.pathname === "/api/fs/tree") {
          const dirPath = url.searchParams.get("path") || "";
          const tree = scanFsDirectory(dirPath);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(tree));
          return;
        }
        if (url.pathname === "/api/fs/read") {
          const filePath = url.searchParams.get("path") || "";
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const binaryExts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".svg", ".pdf"];
            if (binaryExts.includes(ext)) {
              const buffer = fs.readFileSync(filePath);
              const base64 = buffer.toString("base64");
              const mime = ext === ".svg" ? "image/svg+xml" : ext === ".pdf" ? "application/pdf" : `image/${ext.slice(1)}`;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ base64, mime }));
            } else {
              const content = fs.readFileSync(filePath, "utf-8");
              res.setHeader("Content-Type", "application/json");
              res.end(content);
            }
          } else {
            res.statusCode = 404;
            res.end("File not found");
          }
          return;
        }
        if (url.pathname === "/api/fs/write") {
          let body = "";
          req.on("data", (chunk: any) => { body += chunk; });
          req.on("end", () => {
            try {
              const { path: filePath, content } = JSON.parse(body);
              fs.writeFileSync(filePath, content, "utf-8");
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(err.message);
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devFsApiPlugin()],
  clearScreen: false,
  server: {
    host: "127.0.0.1",
    port: 1552,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    fs: {
      allow: [".."],
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: `${path.resolve(import.meta.dirname, "../frontend/src")}/`,
      },
      {
        find: "@desktop",
        replacement: `${path.resolve(import.meta.dirname, "./src")}/`,
      },
      {
        find: "backend",
        replacement: `${path.resolve(import.meta.dirname, "../backend")}/`,
      },
    ],
  },
  define: {
    __BUILD_VERSION__: JSON.stringify("desktop-1.0.0"),
  },
});
