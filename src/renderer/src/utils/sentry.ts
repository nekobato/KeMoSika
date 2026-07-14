import { init as initElectronSentry } from "@sentry/electron/renderer";
import { init as initVueSentry } from "@sentry/vue";
import type { App as VueApp } from "vue";
import pkg from "../../../../package.json";

type VueSentryOptions = NonNullable<Parameters<typeof initVueSentry>[0]>;

const shouldReportToSentry = (): boolean => {
  return import.meta.env.PROD && Boolean(import.meta.env.VITE_SENTRY_DSN);
};

export const initSentry = (app: VueApp<Element>): void => {
  if (!shouldReportToSentry()) return;

  const options: VueSentryOptions = {
    app,
    attachProps: true,
    release: pkg.version,
    environment: "production"
  };

  initElectronSentry<VueSentryOptions>(options, initVueSentry);
};
