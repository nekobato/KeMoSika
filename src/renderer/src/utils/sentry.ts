import { init as initElectronSentry } from "@sentry/electron/renderer";
import { init as initVueSentry } from "@sentry/vue";
import type { App as VueApp } from "vue";
import pkg from "../../../../package.json";
import type { AppSettings } from "@shared/app-api";

type VueSentryOptions = NonNullable<Parameters<typeof initVueSentry>[0]>;
type ElectronRendererOptions = NonNullable<
  Parameters<typeof initElectronSentry>[0]
>;

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
    sendDefaultPii: false,
    maxBreadcrumbs: 0,
    beforeSend: (event) => (shouldReportToSentry() ? event : null),
    beforeSendTransaction: () => null,
    release: pkg.version,
    environment: "production",
  };

  // The Electron and Vue SDKs resolve separate @sentry/core type identities.
  // Their runtime option contract is compatible, so isolate the cast here.
  initElectronSentry(
    options as ElectronRendererOptions,
    initVueSentry as unknown as (options: ElectronRendererOptions) => void,
  );
};
