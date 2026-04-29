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
import { uIOhook } from "uiohook-napi";
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
  parseLayoutData,
  parseVisualizerStartOptions
} from "./validation";

initSentry();

// 残像防止
app.disableHardwareAcceleration();

let editorWindow: BrowserWindow | null;
let visualizerWindow: BrowserWindow | null;
let accessibilityTrusted = process.platform !== "darwin";

uIOhook.on("input", (event) => {
  visualizerWindow?.webContents.send("input", event);
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
    });
  });
