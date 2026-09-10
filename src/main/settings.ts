import Store from "electron-store";
import type { AppSettings } from "@shared/app-api";

// Keep application preferences separate from imported layout/config data.
const settingsStore = new Store<AppSettings>({
  name: "settings",
  schema: {
    errorReportingEnabled: { type: "boolean", default: false },
  },
  defaults: { errorReportingEnabled: false },
  ...(process.env.KEMOSIKA_CONFIG_DIR
    ? { cwd: process.env.KEMOSIKA_CONFIG_DIR }
    : {}),
});

export const getAppSettings = (): AppSettings => ({
  errorReportingEnabled: settingsStore.get("errorReportingEnabled") === true,
});

export const setErrorReportingEnabled = (enabled: boolean): AppSettings => {
  settingsStore.set("errorReportingEnabled", enabled);
  return getAppSettings();
};
