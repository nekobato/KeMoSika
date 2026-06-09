/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    DIST: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
    SENTRY_DSN?: string;
    VITE_SENTRY_DSN?: string;
  }
}

interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly VITE_SENTRY_DSN: string;
}
