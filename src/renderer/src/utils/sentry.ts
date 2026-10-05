import { init as initElectronSentry } from "@sentry/electron/renderer";
import { init as initVueSentry } from "@sentry/vue";
import type { App as VueApp } from "vue";
import pkg from "../../../../package.json";
import type { AppSettings } from "@shared/app-api";

type VueSentryOptions = NonNullable<Parameters<typeof initVueSentry>[0]>;

const shouldReportToSentry = (): boolean => {
  return import.meta.env.PROD && enabled;
};

let enabled = false;
let initialized = false;

export const initSentry = (app: VueApp<Element>): void => {
  if (!import.meta.env.PROD) return;

  let settingsChanged = false;
  const applySettings = (settings: AppSettings) => {
    enabled = settings.errorReportingEnabled === true;
    if (enabled && !initialized) {
      initializeClient(app);
      initialized = true;
    }
  };

  window.kemosikaApi.onAppSettingsChanged((settings) => {
    settingsChanged = true;
    applySettings(settings);
  });
  void window.kemosikaApi
    .getAppSettings()
    .then((settings) => {
      if (!settingsChanged) applySettings(settings);
    })
    .catch(() => {
      // Fail closed; preference loading must not stop the application mounting.
    });
};

const initializeClient = (app: VueApp<Element>): void => {
  const options: VueSentryOptions = {
    app,
    attachProps: false,
    // Match the main process's error-only data collection policy.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      graphQL: { document: false, variables: false },
      queues: false,
      stackFrameVariables: false,
    },
    maxBreadcrumbs: 0,
    beforeSend: (event) => (shouldReportToSentry() ? event : null),
    tracesSampleRate: 0,
    beforeSendLog: () => null,
    release: pkg.version,
    environment: "production",
  };

  initElectronSentry(options, initVueSentry);
};
