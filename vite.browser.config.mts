import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import { browserApiServerPlugin } from "./src/local-dev/browser-api-server";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Vite configuration for checking the renderer in a normal browser.
 */
export default defineConfig({
  root: resolve(projectRoot, "src/renderer"),
  plugins: [browserApiServerPlugin(), vue(), svgLoader()],
  resolve: {
    alias: {
      "@": resolve(projectRoot, "src/renderer/src"),
      "@shared": resolve(projectRoot, "src/shared")
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
      }
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true
  }
});
