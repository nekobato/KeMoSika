import pkg from "../../../../package.json";

/**
 * Initializes Sentry in Electron renderer processes.
 */
export const initSentry = () => {
  if (window.kemosikaBrowserUse) {
    return;
  }

  import("@sentry/electron/renderer").then(({ init }) => {
    init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      release: pkg.version,
      environment: import.meta.env.MODE
    });
  });
};
