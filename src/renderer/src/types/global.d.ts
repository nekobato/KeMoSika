import type { AppApi, ConfigData } from "@shared/app-api";

export {};

declare global {
  interface Window {
    kemosikaApi: AppApi;
    openUrl: (e: Event, url: string) => void;
    removeLoading: () => void;
    kemosikaBrowserUse?: {
      emitInput: (event: unknown) => void;
      getConfig: () => Promise<ConfigData>;
      resetConfig: () => Promise<ConfigData | undefined>;
    };
  }
}
