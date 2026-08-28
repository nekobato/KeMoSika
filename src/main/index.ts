import {
  BrowserWindow,
  app,
  globalShortcut,
  type MenuItem,
  type MenuItemConstructorOptions,
  type IpcMainInvokeEvent,
  ipcMain,
  Menu,
  systemPreferences,
  dialog
} from "electron";
import { EventType, UiohookKey, uIOhook } from "uiohook-napi";
import * as store from "./store";
import { initSentry } from "./utils/sentry";
import { deleteImage, saveImageBuffer } from "./utils/image";
import { listSystemFonts } from "./utils/font";
import { nanoid } from "nanoid/non-secure";
import { createEditorWindow } from "./windows/editor-wIndow";
import { createVisualizerWindow } from "./windows/visualizer-window";
import { assertAllowedIpcSender } from "./security";
import {
  registerMediaProtocol,
  registerMediaSchemePrivileges
} from "./media-protocol";
import {
  parseConfigData,
  parseId,
  parseImageSaveBufferInput,
  parseLayoutExportInput,
  parseLayoutImportArchiveInput,
  parseLayoutImportPathInput,
  parseLayoutData,
  parseVisualizerStartOptions
} from "./validation";
import {
  createLayoutExportFileName,
  writeLayoutExportArchive
} from "./layout-export";
import {
  prepareLayoutImport,
  readLayoutImportPackageFromArchive,
  readLayoutImportPackageFromPath,
  type LayoutImportPackage
} from "./layout-import";
import type {
  KeyboardLockState,
  LayoutImportResult
} from "@shared/app-api";
import {
  createKeyboardLockStateTracker,
  readKeyboardLockState
} from "./keyboard-lock-state";
import { createMouseButtonNormalizer } from "./mouse-button-normalizer";

initSentry();

// 残像防止
app.disableHardwareAcceleration();

let editorWindow: BrowserWindow | null;
let visualizerWindow: BrowserWindow | null;
let accessibilityTrusted = process.platform !== "darwin";

const keyboardLockStateTracker = createKeyboardLockStateTracker({
  [UiohookKey.CapsLock]: "capsLock",
  [UiohookKey.NumLock]: "numLock",
  [UiohookKey.ScrollLock]: "scrollLock"
});
const mouseButtonNormalizer = createMouseButtonNormalizer({
  repairRepeatedOtherButtonPresses: process.platform === "darwin"
});
let hasLoggedMouseButtonRepair = false;

const sendKeyboardLockState = (state: KeyboardLockState): void => {
  visualizerWindow?.webContents.send("keyboard-lock-state", state);
};

const synchronizeKeyboardLockState = async (): Promise<KeyboardLockState> => {
  const current = keyboardLockStateTracker.snapshot();
  let values = {
    capsLock: current.capsLock,
    numLock: current.numLock,
    scrollLock: current.scrollLock
  };

  try {
    values = await readKeyboardLockState();
  } catch (error) {
    console.warn("keyboard lock-state probe failed", error);
  }

  const state = keyboardLockStateTracker.reset(values);
  sendKeyboardLockState(state);
  return state;
};

uIOhook.on("input", (event) => {
  const normalization =
    event.type === EventType.EVENT_MOUSE_PRESSED ||
    event.type === EventType.EVENT_MOUSE_RELEASED
      ? mouseButtonNormalizer.normalize(event)
      : { event, repairedRelease: false };

  if (normalization.repairedRelease && !hasLoggedMouseButtonRepair) {
    hasLoggedMouseButtonRepair = true;
    console.warn(
      "Repaired a repeated macOS mouse-button press as a release event."
    );
  }

  visualizerWindow?.webContents.send("input", normalization.event);

  if (event.type === EventType.EVENT_KEY_PRESSED) {
    const state = keyboardLockStateTracker.press(event.keycode);
    if (state) sendKeyboardLockState(state);
  } else if (event.type === EventType.EVENT_KEY_RELEASED) {
    keyboardLockStateTracker.release(event.keycode);
  }
});

const ensureAccessibilityPermission = (prompt = false) => {
  if (process.platform !== "darwin") return true;
  accessibilityTrusted = systemPreferences.isTrustedAccessibilityClient(prompt);
  return accessibilityTrusted;
};

/**
 * Registers an IPC handler after validating the renderer origin.
 */
const handleRendererInvoke = <T>(
  channel: string,
  handler: (
    event: IpcMainInvokeEvent,
    payload: unknown
  ) => Promise<T> | T
): void => {
  ipcMain.handle(channel, async (event, payload) => {
    assertAllowedIpcSender(event);
    return await handler(event, payload);
  });
};

/**
 * Persists a validated layout import package without overwriting existing data.
 */
const saveImportedLayoutPackage = (
  sourcePackage: LayoutImportPackage
): LayoutImportResult => {
  const config = store.getStore();
  const preparedImport = prepareLayoutImport({
    sourcePackage,
    existingLayouts: config.layouts || [],
    createId: nanoid
  });
  const savedImageFileNames: string[] = [];

  try {
    const importedImages = preparedImport.images.map((image) => {
      const fileName = saveImageBuffer(image.id, image.data);
      savedImageFileNames.push(fileName);

      return {
        id: image.id,
        fileName
      };
    });

    store.setStore({
      layouts: [...(config.layouts || []), preparedImport.layout],
      images: [...(config.images || []), ...importedImages]
    });
  } catch (error) {
    savedImageFileNames.forEach((fileName) => {
      try {
        deleteImage(fileName);
      } catch {
        // Rollback should keep going even when an image was already absent.
      }
    });
    throw error;
  }

  return {
    canceled: false,
    layoutId: preparedImport.layout.id,
    layoutName: preparedImport.layout.name,
    imageCount: preparedImport.images.length
  };
};

const showAccessibilityDialog = () => {
  const win = visualizerWindow || editorWindow || null;
  dialog.showMessageBox(win, {
    type: "warning",
    buttons: ["OK"],
    defaultId: 0,
    title: "アクセシビリティ許可が必要です",
    message: "KeMoSika が入力イベントを取得するにはアクセシビリティ権限が必要です。",
    detail:
      "システム設定 > プライバシーとセキュリティ > アクセシビリティ で KeMoSika を許可した後、もう一度お試しください。"
  });
};

function setMenu() {
  const template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: "KeMoSika",
      submenu: [
        {
          role: "about"
        },
        {
          type: "separator"
        },
        {
          role: "quit"
        }
      ]
    },
    {
      label: "Edit",
      role: "editMenu"
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

registerMediaSchemePrivileges();

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    editorWindow = createEditorWindow();
  }
});

app.on("before-quit", () => {
  uIOhook.stop();
  globalShortcut.unregisterAll();
  editorWindow?.removeAllListeners();
  visualizerWindow?.removeAllListeners();
  editorWindow = null;
  visualizerWindow = null;
});

app
  .whenReady()
  .then(() => {
    // macOS での入力フック用に早めに権限ダイアログを表示
    ensureAccessibilityPermission(true);
  })
  .then(setMenu)
  .then(() => {
    registerMediaProtocol();

    handleRendererInvoke("uiohook:start", async () => {
      console.log("uiohook:start");
      if (!ensureAccessibilityPermission(true)) {
        showAccessibilityDialog();
        return { started: false, reason: "permission" };
      }

      try {
        mouseButtonNormalizer.reset();
        await synchronizeKeyboardLockState();
        uIOhook.start();
        return { started: true };
      } catch (error) {
        console.error("uIOhook.start failed", error);
        return { started: false, reason: "error" };
      }
    });

    handleRendererInvoke("uiohook:stop", async () => {
      console.log("uiohook:stop");
      uIOhook.stop();
      mouseButtonNormalizer.reset();
      return true;
    });

    handleRendererInvoke("config:get", async () => {
      return store.getStore();
    });

    handleRendererInvoke("config:set", async (_, data) => {
      const config = parseConfigData(data);
      console.log("set:config", data);
      return store.setStore(config);
    });

    handleRendererInvoke("layout:get-all", async () => {
      return store.getStore().layouts || [];
    });

    // save, update
    handleRendererInvoke("layout:save", async (_, payload) => {
      const layout = parseLayoutData(payload);
      store.setLayout(layout);
      return store.getStore();
    });

    handleRendererInvoke("layout:delete", async (_, payload) => {
      const id = parseId(payload);
      store.deleteLayout(id);
      return store.getStore();
    });

    handleRendererInvoke("layout:export", async (_, payload) => {
      const input = parseLayoutExportInput(payload);
      const layout = store
        .getStore()
        .layouts.find((item) => item.id === input.layoutId);

      if (!layout) {
        throw new Error("Layout was not found");
      }

      const saveDialogOptions = {
        title: "レイアウトをエクスポート",
        buttonLabel: "エクスポート",
        defaultPath: createLayoutExportFileName(layout.name),
        filters: [
          { name: "KeMoSika Layout", extensions: ["kemosika-layout"] },
          { name: "ZIP Archive", extensions: ["zip"] }
        ]
      };
      const saveResult = editorWindow
        ? await dialog.showSaveDialog(editorWindow, saveDialogOptions)
        : await dialog.showSaveDialog(saveDialogOptions);

      if (saveResult.canceled || !saveResult.filePath) {
        return { canceled: true };
      }

      const archiveResult = await writeLayoutExportArchive({
        layout,
        images: store.getStore().images || [],
        outputPath: saveResult.filePath
      });

      return {
        canceled: false,
        filePath: archiveResult.filePath,
        imageCount: archiveResult.imageCount
      };
    });

    handleRendererInvoke("layout:import-select-directory", async () => {
      const openDialogOptions = {
        title: "レイアウトをインポート",
        buttonLabel: "インポート",
        properties: ["openDirectory"] as const
      };
      const openResult = editorWindow
        ? await dialog.showOpenDialog(editorWindow, openDialogOptions)
        : await dialog.showOpenDialog(openDialogOptions);

      if (openResult.canceled || !openResult.filePaths[0]) {
        return { canceled: true };
      }

      const sourcePackage = await readLayoutImportPackageFromPath(
        openResult.filePaths[0]
      );
      return saveImportedLayoutPackage(sourcePackage);
    });

    handleRendererInvoke("layout:import-from-path", async (_, payload) => {
      const input = parseLayoutImportPathInput(payload);
      const sourcePackage = await readLayoutImportPackageFromPath(input.path);
      return saveImportedLayoutPackage(sourcePackage);
    });

    handleRendererInvoke("layout:import-archive", async (_, payload) => {
      const input = parseLayoutImportArchiveInput(payload);
      const sourcePackage = readLayoutImportPackageFromArchive(
        input.buffer,
        input.fileName
      );
      return saveImportedLayoutPackage(sourcePackage);
    });

    handleRendererInvoke("image:save-buffer", async (_, payload) => {
      const data = parseImageSaveBufferInput(payload);
      const id = nanoid();
      const fileName = saveImageBuffer(id, data.buffer);
      store.createImage(id, fileName);
      return { id, fileName };
    });

    handleRendererInvoke("image:delete", async (_, payload) => {
      const id = parseId(payload);
      const images = store.getStore().images || [];
      const index = images.findIndex((item) => item.id === id);
      if (index > -1) {
        deleteImage(images[index].fileName);
        images.splice(index, 1);
      }
      store.setImages(images);
      return store.getStore();
    });

    handleRendererInvoke("image:list", async () => {
      return store.getStore().images.map((image) => {
        return { ...image, path: `images/${image.fileName}` };
      });
    });

    handleRendererInvoke("font:list", async () => {
      return listSystemFonts();
    });

    handleRendererInvoke("keyboard:get-lock-state", async () => {
      return keyboardLockStateTracker.snapshot();
    });

    handleRendererInvoke(
      "visualizer:start",
      async (_, payload) => {
        const options = parseVisualizerStartOptions(payload);
        const trusted = ensureAccessibilityPermission(true);
        if (!trusted) {
          showAccessibilityDialog();
          return { started: false, reason: "permission" };
        }

        visualizerWindow?.setContentSize(
          options.size.width,
          options.size.height
        );
        visualizerWindow?.show();
        console.log("visualizer:start", options);
        visualizerWindow?.webContents.send("visualizer:start", options);

        try {
          mouseButtonNormalizer.reset();
          await synchronizeKeyboardLockState();
          uIOhook.start();
          return { started: true };
        } catch (error) {
          console.error("visualizer uIOhook.start failed", error);
          dialog.showMessageBox(visualizerWindow || editorWindow || null, {
            type: "error",
            buttons: ["OK"],
            defaultId: 0,
            title: "入力フックの開始に失敗しました",
            message: "アクセシビリティ権限が付与されているか確認してください。",
            detail: String(error)
          });
          return { started: false, reason: "error" };
        }
      }
    );

    handleRendererInvoke("visualizer:close", async () => {
      visualizerWindow?.webContents.send("visualizer:close");
      visualizerWindow?.hide();
      visualizerWindow?.setSize(0, 0);
      return true;
    });
  })
  .then(() => {
    editorWindow = createEditorWindow();
    visualizerWindow = createVisualizerWindow();

    visualizerWindow?.on("hide", () => {
      console.log("visualizer:hide");
      uIOhook.stop();
      mouseButtonNormalizer.reset();
    });
  });
