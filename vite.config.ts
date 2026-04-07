import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite-plus";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: `${path.resolve(__dirname, "src")}/`,
      },
      {
        find: "backend",
        replacement: `${path.resolve(__dirname, "backend")}/`,
      },
    ],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".scss"],
  },
  server: {
    host: "127.0.0.1",
    port: 5551,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules into separate chunks,
          // but skip lazy-loaded heavy libraries so they
          // remain as deferred async chunks.
          if (id.includes("node_modules")) {
            const pkg = id.toString().split("node_modules/")[1].split("/")[0];
            if (pkg === "@blocknote" || pkg === "@embedpdf") return undefined;
            return pkg;
          }
        },
      },
    },
  },
  define: {
    __BUILD_VERSION__: JSON.stringify(
      (() => {
        const now = new Date();
        const yy = now.getFullYear().toString().slice(-1);
        const MM = (now.getMonth() + 1).toString().padStart(2, "0");
        const DD = now.getDate().toString().padStart(2, "0");
        const HH = now.getHours().toString().padStart(2, "0");
        const mm = now.getMinutes().toString().padStart(2, "0");
        return `${yy}.${MM}.${DD}.${HH}${mm}`;
      })(),
    ),
  },
});
