import { app } from "electron";
import { captureException, init } from "@sentry/electron/main";

const getSentryDsn = (): string => {
  return import.meta.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN || "";
};

const shouldReportToSentry = (): boolean => {
  return import.meta.env.PROD && getSentryDsn().length > 0;
};

export const initSentry = (): void => {
  if (!shouldReportToSentry()) return;

  init({
    dsn: getSentryDsn(),
    release: app.getVersion(),
    environment: "production"
  });
};

export const reportError = (error: unknown): void => {
  if (!shouldReportToSentry()) return;

  captureException(error);
};
