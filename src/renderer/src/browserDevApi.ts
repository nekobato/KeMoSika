import type {
  AppApi,
  ConfigData,
  ImageListItem,
  ImageSaveInput,
  ImageSaveResult,
  InputEventListener,
  VisualizerStartListener,
  VisualizerStartOptions,
  VoidEventListener
} from "@shared/app-api";
import type { LayoutData } from "@shared/types";

type EventMap = {
  input: unknown;
  "visualizer:start": VisualizerStartOptions;
  "visualizer:close": undefined;
};

const listeners = new Map<keyof EventMap, Set<(payload: unknown) => void>>();

/**
 * Reads JSON from the local dev API.
 */
const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Local dev API failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
};

/**
 * Sends a JSON body to the local dev API.
 */
const sendJson = async <T>(
  path: string,
  method: string,
  body?: unknown
): Promise<T> => {
  return await fetchJson<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
};

/**
 * Registers a browser-local event listener.
 */
const on = <K extends keyof EventMap>(
  event: K,
  listener: (payload: EventMap[K]) => void
): void => {
  const eventListeners = listeners.get(event) || new Set<(payload: unknown) => void>();
  eventListeners.add(listener as (payload: unknown) => void);
  listeners.set(event, eventListeners);
};

/**
 * Emits a browser-local event.
 */
const emit = <K extends keyof EventMap>(
  event: K,
  payload: EventMap[K]
): void => {
  listeners.get(event)?.forEach((listener) => listener(payload));
};

/**
 * Returns whether the current URL requests a dev API reset.
 */
const shouldResetConfig = (): boolean => {
  return new URL(window.location.href).searchParams.has(
    "kemosika-browser-use-reset"
  );
};

/**
 * Creates a browser client backed by the local dev API server.
 */
const createBrowserDevApi = (): AppApi => {
  return {
    startInputHook: async () => {
      return await sendJson<boolean>("/api/input-hook/start", "POST");
    },
    stopInputHook: async () => {
      return await sendJson<boolean>("/api/input-hook/stop", "POST");
    },
    getConfig: async () => {
      return await fetchJson<ConfigData>("/api/config");
    },
    setConfig: async (data: ConfigData) => {
      return await sendJson<ConfigData>("/api/config", "PUT", data);
    },
    getLayouts: async () => {
      return await fetchJson<LayoutData[]>("/api/layouts");
    },
    saveLayout: async (layout: LayoutData) => {
      return await sendJson<ConfigData>(
        `/api/layouts/${encodeURIComponent(layout.id)}`,
        "PUT",
        layout
      );
    },
    deleteLayout: async (id: string) => {
      return await sendJson<ConfigData>(
        `/api/layouts/${encodeURIComponent(id)}`,
        "DELETE"
      );
    },
    saveImage: async (input: ImageSaveInput) => {
      return await sendJson<ImageSaveResult>("/api/images", "POST", input);
    },
    deleteImage: async (id: string) => {
      return await sendJson<ConfigData>(
        `/api/images/${encodeURIComponent(id)}`,
        "DELETE"
      );
    },
    listImages: async () => {
      return await fetchJson<ImageListItem[]>("/api/images");
    },
    startVisualizer: async (options: VisualizerStartOptions) => {
      const result = await sendJson<boolean>(
        "/api/visualizer/start",
        "POST",
        options
      );
      emit("visualizer:start", options);
      window.location.hash = `/visualizer/${options.layoutId}`;
      return result;
    },
    closeVisualizer: async () => {
      const result = await sendJson<boolean>("/api/visualizer/close", "POST");
      emit("visualizer:close", undefined);
      window.location.hash = "/";
      return result;
    },
    onInput: (listener: InputEventListener) => {
      on("input", listener);
    },
    onVisualizerStart: (listener: VisualizerStartListener) => {
      on("visualizer:start", listener);
    },
    onVisualizerClose: (listener: VoidEventListener) => {
      on("visualizer:close", listener);
    },
    resetPreviewData: async () => {
      return await sendJson<ConfigData>("/api/dev/reset", "POST");
    }
  };
};

/**
 * Installs browser-only local dev APIs for Codex Browser Use.
 */
export const installBrowserDevApi = async (): Promise<void> => {
  if (typeof window === "undefined" || window.kemosikaApi) {
    return;
  }

  const api = createBrowserDevApi();
  window.kemosikaApi = api;
  window.openUrl = (_event: Event, url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };
  window.removeLoading = () => undefined;

  window.kemosikaBrowserUse = {
    emitInput: (event: unknown) => emit("input", event),
    getConfig: api.getConfig,
    resetConfig: async () => await api.resetPreviewData?.()
  };

  if (shouldResetConfig()) {
    await api.resetPreviewData?.();
  }
};
