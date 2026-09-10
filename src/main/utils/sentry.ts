import { app } from "electron";
import {
  captureException,
  init,
  IPCMode,
  makeElectronTransport,
} from "@sentry/electron/main";
import { getAppSettings } from "../settings";
import { sanitizeSentryEvent } from "./sentryPrivacy";

let initialized = false;

const getSentryDsn = (): string => {
  return import.meta.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN || "";
};

const shouldReportToSentry = (): boolean => {
  return (
    import.meta.env.PROD &&
    getSentryDsn().length > 0 &&
    getAppSettings().errorReportingEnabled
  );
};

export const initSentry = (): void => {
  if (initialized || !shouldReportToSentry()) return;

  init({
    dsn: getSentryDsn(),
    release: app.getVersion(),
    environment: "production",
    ipcMode: IPCMode.Classic,
    sendDefaultPii: false,
    sendClientReports: false,
    maxBreadcrumbs: 0,
    // The explicit preload bridge supports first opt-in after app.ready.
    // Native dumps and session tracking are outside this error-report option.
    integrations: (defaults) =>
      defaults.filter(
        (integration) =>
          ![
            "SentryMinidump",
            "MainProcessSession",
            "PreloadInjection",
          ].includes(integration.name),
      ),
    beforeSend: (event, hint) => {
      hint.attachments = [];
      return shouldReportToSentry() ? sanitizeSentryEvent(event) : null;
    },
    beforeSendTransaction: () => null,
    // Do not persist offline reports that could be sent after consent changes.
    transport: (options) => {
      const transport = makeElectronTransport(options);
      return {
        send: (envelope) =>
          shouldReportToSentry()
            ? transport.send(envelope)
            : Promise.resolve({}),
        flush: (timeout) => transport.flush(timeout),
      };
    },
  });
  initialized = true;
};

export const reportError = (error: unknown): void => {
  if (!shouldReportToSentry()) return;

  captureException(error);
};
