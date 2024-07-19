import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve("src/main/index.ts"),
        formats: ["es"]
      }
    },
    resolve: {
      alias: {
        "@shared": resolve(__dirname, "./src/shared")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [vue(), svgLoader()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src/renderer/src"),
        "@shared": resolve(__dirname, "./src/shared")
      }
    }
  }
});
