import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import type {
  ConfigData,
  ImageListItem,
  ImageSaveInput,
  ImageSaveResult
} from "../shared/app-api";
import type { LayoutData } from "../shared/types";
import { createBrowserPreviewConfig } from "./browser-preview-config";

const apiPrefix = "/api/";

let config = createBrowserPreviewConfig();

/**
 * Clones JSON-compatible values before returning them from the dev API.
 */
const clone = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

/**
 * Creates a local identifier for dev-only records.
 */
const createId = (): string => {
  return globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
};

/**
 * Sends a JSON response from the dev API.
 */
const sendJson = (
  response: ServerResponse,
  statusCode: number,
  body: unknown
): void => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
};

/**
 * Sends a JSON error response from the dev API.
 */
const sendError = (
  response: ServerResponse,
  statusCode: number,
  message: string
): void => {
  sendJson(response, statusCode, { error: message });
};

/**
 * Reads a JSON request body from a Node request stream.
 */
const readJsonBody = async <T>(request: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return (rawBody ? JSON.parse(rawBody) : undefined) as T;
};

/**
 * Lists image records with browser-preview paths.
 */
const listImages = (): ImageListItem[] => {
  return config.images.map((image) => ({
    ...image,
    path: `browser-use/${image.fileName}`
  }));
};

/**
 * Saves a layout into the in-memory dev config.
 */
const saveLayout = (layout: LayoutData): ConfigData => {
  const nextLayout = clone(layout);
  const index = config.layouts.findIndex((item) => item.id === nextLayout.id);

  if (index === -1) {
    config.layouts.push(nextLayout);
  } else {
    config.layouts[index] = nextLayout;
  }

  return clone(config);
};

/**
 * Deletes a layout from the in-memory dev config.
 */
const deleteLayout = (id: string): ConfigData => {
  config.layouts = config.layouts.filter((layout) => layout.id !== id);
  return clone(config);
};

/**
 * Saves an image record into the in-memory dev config.
 */
const saveImage = (input: ImageSaveInput = {}): ImageSaveResult => {
  const id = createId();
  const fileName = input.imagePath?.split(/[\\/]/).pop() || `${id}.png`;
  config.images.push({ id, fileName });
  return { id, fileName };
};

/**
 * Deletes an image from the in-memory dev config.
 */
const deleteImage = (id: string): ConfigData => {
  config.images = config.images.filter((image) => image.id !== id);
  return clone(config);
};

/**
 * Resets the in-memory dev config to the browser preview defaults.
 */
const resetConfig = (): ConfigData => {
  config = createBrowserPreviewConfig();
  return clone(config);
};

/**
 * Handles a local dev API request.
 */
const handleApiRequest = async (
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> => {
  if (!request.url?.startsWith(apiPrefix)) {
    return false;
  }

  const method = request.method || "GET";
  const url = new URL(request.url, "http://127.0.0.1");
  const path = url.pathname;

  try {
    if (method === "GET" && path === "/api/config") {
      sendJson(response, 200, clone(config));
      return true;
    }

    if (method === "PUT" && path === "/api/config") {
      config = await readJsonBody<ConfigData>(request);
      sendJson(response, 200, clone(config));
      return true;
    }

    if (method === "GET" && path === "/api/layouts") {
      sendJson(response, 200, clone(config.layouts));
      return true;
    }

    if (method === "PUT" && path.startsWith("/api/layouts/")) {
      const layout = await readJsonBody<LayoutData>(request);
      sendJson(response, 200, saveLayout(layout));
      return true;
    }

    if (method === "DELETE" && path.startsWith("/api/layouts/")) {
      const id = decodeURIComponent(path.replace("/api/layouts/", ""));
      sendJson(response, 200, deleteLayout(id));
      return true;
    }

    if (method === "GET" && path === "/api/images") {
      sendJson(response, 200, listImages());
      return true;
    }

    if (method === "POST" && path === "/api/images") {
      const input = await readJsonBody<ImageSaveInput>(request);
      sendJson(response, 200, saveImage(input));
      return true;
    }

    if (method === "DELETE" && path.startsWith("/api/images/")) {
      const id = decodeURIComponent(path.replace("/api/images/", ""));
      sendJson(response, 200, deleteImage(id));
      return true;
    }

    if (method === "POST" && path === "/api/input-hook/start") {
      sendJson(response, 200, true);
      return true;
    }

    if (method === "POST" && path === "/api/input-hook/stop") {
      sendJson(response, 200, true);
      return true;
    }

    if (method === "POST" && path === "/api/visualizer/start") {
      await readJsonBody<unknown>(request);
      sendJson(response, 200, true);
      return true;
    }

    if (method === "POST" && path === "/api/visualizer/close") {
      sendJson(response, 200, true);
      return true;
    }

    if (method === "POST" && path === "/api/dev/reset") {
      sendJson(response, 200, resetConfig());
      return true;
    }

    sendError(response, 404, `Unknown dev API route: ${method} ${path}`);
    return true;
  } catch (error) {
    sendError(
      response,
      500,
      error instanceof Error ? error.message : "Unknown dev API error"
    );
    return true;
  }
};

/**
 * Creates the local dev API Vite plugin for Browser Use checks.
 */
export const browserApiServerPlugin = (): Plugin => {
  return {
    name: "kemosika-browser-api-server",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        handleApiRequest(request, response)
          .then((handled) => {
            if (!handled) {
              next();
            }
          })
          .catch(next);
      });
    }
  };
};
