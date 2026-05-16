import type { Page } from "@playwright/test";
import type { ElectronApplication } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { strFromU8, unzipSync } from "fflate";
import { test, expect } from "./electron.fixture";
import type { ConfigData, LayoutImportResult } from "@shared/app-api";
import type { LayoutData } from "@shared/types";

type KemosikaWindow = Window & {
  kemosikaApi: {
    getConfig: () => Promise<ConfigData>;
    importLayoutFromPath: (
      input: { path: string }
    ) => Promise<LayoutImportResult>;
    saveLayout: (layout: LayoutData) => Promise<ConfigData>;
  };
};

/**
 * Returns the distance between the preview viewport center and layout center.
 */
const getPreviewCenterOffset = async (
  appWindow: Page
): Promise<{ x: number; y: number }> =>
  await appWindow.locator(".preview-container").evaluate((container) => {
    const preview = container.querySelector<HTMLElement>(
      "[data-testid='layout-preview']"
    );

    if (!preview) {
      throw new Error("layout preview was not found");
    }

    const viewportCenterX =
      container.scrollLeft + container.clientWidth / 2;
    const viewportCenterY =
      container.scrollTop + container.clientHeight / 2;
    const previewCenterX = preview.offsetLeft + preview.offsetWidth / 2;
    const previewCenterY = preview.offsetTop + preview.offsetHeight / 2;

    return {
      x: viewportCenterX - previewCenterX,
      y: viewportCenterY - previewCenterY
    };
  });

/**
 * Asserts that the selected layout is centered in the scrollable preview area.
 */
const expectPreviewCentered = async (appWindow: Page): Promise<void> => {
  await expect(async () => {
    const offset = await getPreviewCenterOffset(appWindow);
    expect(Math.abs(offset.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(offset.y)).toBeLessThanOrEqual(1);
  }).toPass();
};

/**
 * Copies a built-in layout into user layouts and exports it to the given path.
 */
const exportAnsi60Layout = async (
  appWindow: Page,
  electronApp: ElectronApplication,
  exportPath: string
): Promise<void> => {
  await electronApp.evaluate(
    ({ dialog }, filePath) => {
      (dialog as any).showSaveDialog = async () => ({
        canceled: false,
        filePath
      });
    },
    exportPath
  );

  await appWindow.getByText("ANSI US 60%", { exact: true }).click();
  await appWindow.getByTestId("layout-edit-button").click();
  await appWindow.getByRole("button", { name: "決定" }).click();

  const exportButton = appWindow.getByTestId("layout-export-button");
  await expect(exportButton).toBeEnabled();
  await exportButton.click();
  await expect.poll(() => existsSync(exportPath)).toBe(true);
};

/**
 * Writes all entries from an exported layout archive into a directory.
 */
const writeArchiveDirectory = async (
  archivePath: string,
  directoryPath: string
): Promise<void> => {
  const archive = unzipSync(new Uint8Array(await readFile(archivePath)));

  await Promise.all(
    Object.entries(archive).map(async ([entryPath, data]) => {
      const targetPath = path.join(directoryPath, entryPath);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, data);
    })
  );
};

test.describe("KeMoSika editor", () => {
  test("renders the default editor screen", async ({
    appWindow,
    rendererConsole
  }) => {
    await expect(appWindow).toHaveTitle("KeMoSika");
    await expect(appWindow.locator("#app")).toBeVisible();
    await expect(appWindow.getByText("新しいレイアウト").first()).toBeVisible();
    await expect(
      appWindow.getByRole("button", { name: "新規作成" })
    ).toBeVisible();
    await expect(appWindow.locator(".preview")).toHaveCSS("width", "800px");
    await expectPreviewCentered(appWindow);

    await appWindow.getByText("ANSI US 60%", { exact: true }).click();
    await expect(appWindow).toHaveURL(/layoutId=builtin-ansi-us-60/);
    await expectPreviewCentered(appWindow);
    const spaceKey = appWindow.getByRole("button", {
      name: "Space",
      exact: true
    });
    await expect(spaceKey).toHaveCSS("width", "320px");
    await expect(spaceKey.locator(".key-image.default")).toHaveCSS(
      "object-fit",
      "fill"
    );

    expect(
      rendererConsole.filter((message) => message.startsWith("[pageerror]"))
    ).toEqual([]);
  });

  test("normalizes legacy layouts without a background on save", async ({
    appWindow
  }) => {
    await expect(appWindow.getByText("新しいレイアウト").first()).toBeVisible();

    const background = await appWindow.evaluate(async () => {
      const api = (window as unknown as KemosikaWindow).kemosikaApi;
      const config = await api.getConfig();
      const legacyLayout = { ...config.layouts[0] } as Record<string, unknown>;
      delete legacyLayout.background;

      const savedConfig = await api.saveLayout(legacyLayout as LayoutData);
      const savedLayout = savedConfig.layouts.find(
        (layout) => layout.id === legacyLayout.id
      );

      return savedLayout?.background;
    });

    expect(background).toEqual({
      color: "#252525",
      image: ""
    });
  });

  test("exports a user layout with referenced images", async ({
    appWindow,
    electronApp,
    rendererConsole
  }) => {
    const tempDirectory = await mkdtemp(
      path.join(os.tmpdir(), "kemosika-export-")
    );
    const exportPath = path.join(tempDirectory, "ansi60.kemosika-layout");

    try {
      await exportAnsi60Layout(appWindow, electronApp, exportPath);

      const archive = unzipSync(new Uint8Array(await readFile(exportPath)));
      const manifest = JSON.parse(strFromU8(archive["manifest.json"]));
      const layout = JSON.parse(strFromU8(archive["layout.json"]));

      expect(manifest.schemaVersion).toBe(1);
      expect(manifest.app).toBe("KeMoSika");
      expect(manifest.files.layout).toBe("layout.json");
      expect(manifest.files.images).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "key_default",
            path: "images/key_default.png"
          }),
          expect.objectContaining({
            id: "key_active",
            path: "images/key_active.png"
          })
        ])
      );
      expect(layout.name).toBe("ANSI US 60%");
      expect(layout.keys.length).toBeGreaterThan(0);
      expect(archive["images/key_default.png"]).toBeDefined();
      expect(archive["images/key_active.png"]).toBeDefined();
      expect(
        rendererConsole.filter((message) => message.startsWith("[pageerror]"))
      ).toEqual([]);
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  test("imports an exported layout archive with fresh IDs", async ({
    appWindow,
    electronApp
  }) => {
    const tempDirectory = await mkdtemp(
      path.join(os.tmpdir(), "kemosika-import-archive-")
    );
    const exportPath = path.join(tempDirectory, "ansi60.kemosika-layout");

    try {
      await exportAnsi60Layout(appWindow, electronApp, exportPath);

      const importState = await appWindow.evaluate(async (filePath) => {
        const api = (window as unknown as KemosikaWindow).kemosikaApi;
        const before = await api.getConfig();
        const sourceLayout = before.layouts.find(
          (layout) => layout.name === "ANSI US 60%"
        );
        const result = await api.importLayoutFromPath({ path: filePath });
        const after = await api.getConfig();
        const importedLayout = after.layouts.find(
          (layout) => layout.id === result.layoutId
        );
        const sourceKey = sourceLayout?.keys.find((item) => item.type === "key");
        const importedKey = importedLayout?.keys.find(
          (item) => item.type === "key"
        );

        return {
          beforeImageCount: before.images.length,
          afterImageCount: after.images.length,
          result,
          sourceLayoutId: sourceLayout?.id,
          sourceKeyDefaultImageId:
            sourceKey?.type === "key" ? sourceKey.images.keyDefault : undefined,
          importedLayoutId: importedLayout?.id,
          importedLayoutName: importedLayout?.name,
          importedKeyDefaultImageId:
            importedKey?.type === "key"
              ? importedKey.images.keyDefault
              : undefined
        };
      }, exportPath);

      expect(importState.result.canceled).toBe(false);
      expect(importState.importedLayoutId).toBeTruthy();
      expect(importState.importedLayoutId).not.toBe(importState.sourceLayoutId);
      expect(importState.importedLayoutName).toBe("ANSI US 60% (import)");
      expect(importState.importedKeyDefaultImageId).not.toBe(
        importState.sourceKeyDefaultImageId
      );
      expect(importState.afterImageCount).toBeGreaterThan(
        importState.beforeImageCount
      );
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  test("imports an unpacked layout directory from the import dialog", async ({
    appWindow,
    electronApp,
    rendererConsole
  }) => {
    const tempDirectory = await mkdtemp(
      path.join(os.tmpdir(), "kemosika-import-directory-")
    );
    const exportPath = path.join(tempDirectory, "ansi60.kemosika-layout");
    const importDirectory = path.join(tempDirectory, "ansi60");

    try {
      await exportAnsi60Layout(appWindow, electronApp, exportPath);
      await writeArchiveDirectory(exportPath, importDirectory);

      await electronApp.evaluate(
        ({ dialog }, directoryPath) => {
          (dialog as any).showOpenDialog = async () => ({
            canceled: false,
            filePaths: [directoryPath]
          });
        },
        importDirectory
      );

      await appWindow.getByTestId("layout-import-button").click();
      await appWindow.getByTestId("layout-import-select-folder-button").click();

      await expect(
        appWindow.getByText("ANSI US 60% (import)", { exact: true })
      ).toBeVisible();
      await expect(appWindow).toHaveURL(/layoutId=/);
      expect(
        rendererConsole.filter((message) => message.startsWith("[pageerror]"))
      ).toEqual([]);
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  test("shows an error toast when the selected import directory is invalid", async ({
    appWindow,
    electronApp
  }) => {
    const tempDirectory = await mkdtemp(
      path.join(os.tmpdir(), "kemosika-import-invalid-")
    );

    try {
      await writeFile(path.join(tempDirectory, "manifest.json"), "{}\n");

      await electronApp.evaluate(
        ({ dialog }, directoryPath) => {
          (dialog as any).showOpenDialog = async () => ({
            canceled: false,
            filePaths: [directoryPath]
          });
        },
        tempDirectory
      );

      const beforeCount = await appWindow.evaluate(async () => {
        const api = (window as unknown as KemosikaWindow).kemosikaApi;
        return (await api.getConfig()).layouts.length;
      });

      await appWindow.getByTestId("layout-import-button").click();
      await appWindow.getByTestId("layout-import-select-folder-button").click();

      await expect(appWindow.getByText("インポートに失敗しました")).toBeVisible();

      const afterCount = await appWindow.evaluate(async () => {
        const api = (window as unknown as KemosikaWindow).kemosikaApi;
        return (await api.getConfig()).layouts.length;
      });

      expect(afterCount).toBe(beforeCount);
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });
});
