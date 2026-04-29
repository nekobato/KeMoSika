import { test as base, expect, type Page } from "@playwright/test";
import { _electron as electron, type ElectronApplication } from "playwright";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const projectRoot = process.cwd();
const mainEntry = path.join(projectRoot, "out/main/index.mjs");
const electronExecutable = require("electron") as unknown as string;
const closeTimeoutMs = 5_000;

type KeMoSikaFixtures = {
  electronApp: ElectronApplication;
  appWindow: Page;
  rendererConsole: string[];
};

/**
 * Waits for the given number of milliseconds.
 */
const wait = async (milliseconds: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * Ensures the Electron main bundle exists before launching Playwright.
 */
const ensureBuiltApplication = (): void => {
  if (!existsSync(mainEntry)) {
    throw new Error(
      `Electron entry was not found at ${mainEntry}. Run pnpm run test:e2e:build before playwright test.`
    );
  }
};

/**
 * Launches KeMoSika with an isolated config directory for each test.
 */
const launchApplication = async (
  configDirectory: string
): Promise<ElectronApplication> => {
  ensureBuiltApplication();

  return await electron.launch({
    executablePath: electronExecutable,
    args: ["--no-sandbox", mainEntry],
    cwd: projectRoot,
    env: {
      ...process.env,
      ELECTRON_DISABLE_SECURITY_WARNINGS: "true",
      KEMOSIKA_CONFIG_DIR: configDirectory,
      NODE_ENV: "test",
      SENTRY_DSN: ""
    },
    timeout: 30_000
  });
};

/**
 * Closes the Electron application without leaking a process on teardown.
 */
const closeApplication = async (
  electronApp: ElectronApplication
): Promise<void> => {
  const closePromise = electronApp.close().catch(() => undefined);
  const timeoutPromise = wait(closeTimeoutMs).then(() => {
    const childProcess = electronApp.process();
    if (!childProcess.killed) {
      childProcess.kill("SIGKILL");
    }
  });

  await Promise.race([closePromise, timeoutPromise]);
  await closePromise;
};

/**
 * Returns whether a page is the editor window.
 */
const isEditorWindow = async (page: Page): Promise<boolean> => {
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  return !page.url().includes("#/visualizer");
};

/**
 * Finds the editor window among KeMoSika's Electron windows.
 */
const findEditorWindow = async (
  electronApp: ElectronApplication
): Promise<Page> => {
  for (const page of electronApp.windows()) {
    if (await isEditorWindow(page)) {
      return page;
    }
  }

  return await electronApp.waitForEvent("window", {
    predicate: isEditorWindow,
    timeout: 10_000
  });
};

export const test = base.extend<KeMoSikaFixtures>({
  rendererConsole: async ({}, use) => {
    await use([]);
  },

  electronApp: async ({}, use) => {
    const configDirectory = await mkdtemp(
      path.join(os.tmpdir(), "kemosika-playwright-")
    );
    const electronApp = await launchApplication(configDirectory);

    try {
      await use(electronApp);
    } finally {
      await closeApplication(electronApp);
      await rm(configDirectory, { recursive: true, force: true });
    }
  },

  appWindow: async ({ electronApp, rendererConsole }, use, testInfo) => {
    const appWindow = await findEditorWindow(electronApp);

    appWindow.on("console", (message) => {
      rendererConsole.push(`[${message.type()}] ${message.text()}`);
    });
    appWindow.on("pageerror", (error) => {
      rendererConsole.push(`[pageerror] ${error.message}`);
    });

    await appWindow.waitForLoadState("domcontentloaded");

    await use(appWindow);

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach("renderer-console.log", {
        body: rendererConsole.join("\n"),
        contentType: "text/plain"
      });
      await testInfo.attach("app-window.png", {
        body: await appWindow.screenshot({ timeout: 5_000 }),
        contentType: "image/png"
      });
      return;
    }
  }
});

export { expect };
