import type { AppApi } from "@shared/app-api";

export {};

declare global {
  interface Window {
    kemosikaApi: AppApi;
    openUrl: (e: Event, url: string) => void;
    removeLoading: () => void;
  }
}
