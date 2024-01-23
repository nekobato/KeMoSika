import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(__dirname, "dist-electron"),
      rollupOptions: {
        input: {
          main: resolve(__dirname, "electron/preload.ts")
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(__dirname, "dist-electron"),
      rollupOptions: {
        input: {
          main: resolve(__dirname, "electron/main.ts")
        }
      }
    }
  },
  renderer: {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": resolve("src")
      }
    },
    build: {
      outDir: resolve(__dirname, "dist"),
      rollupOptions: {
        input: {
          index: resolve(__dirname, "index.html")
        }
      }
    }
  }
});
