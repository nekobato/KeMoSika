import { app } from "electron";
import path from "node:path";

export const root = path.join(import.meta.dirname, "..");

export const mainRoot = path.join(import.meta.dirname, "../main");
export const rendererRoot = path.join(import.meta.dirname, "../renderer");
export const preloadRoot = path.join(import.meta.dirname, "../preload");
export const resourcesRoot = app.isPackaged
  ? path.join(import.meta.dirname, "../resources")
  : path.join(import.meta.dirname, "../resources");
export const serverUrl = process.env["ELECTRON_RENDERER_URL"];

export const preload = path.join(preloadRoot, "index.mjs");

export const pageRoot = serverUrl
  ? (serverUrl as string) // dev
  : path.join(rendererRoot, "index.html"); // prod
