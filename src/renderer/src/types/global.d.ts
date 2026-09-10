import type { AppApi } from "@shared/app-api";

export {};

declare global {
  interface Window {
    /** Typed preload API, including persisted application settings. */
    kemosikaApi: AppApi;
    openUrl: (e: Event, url: string) => void;
    removeLoading: () => void;
  }
}
