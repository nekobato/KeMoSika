import {
  BrowserWindow,
  app,
  globalShortcut,
  type MenuItem,
  type MenuItemConstructorOptions,
  ipcMain,
  Menu,
  protocol,
  net
} from "electron";
import path from "node:path";
import { uIOhook } from "uiohook-napi";
import * as store from "./store";
import { initSentry } from "./utils/sentry";
import { deleteImage, imagePath, saveImage } from "./utils/image";
import { nanoid } from "nanoid/non-secure";
import { createEditorWindow } from "./windows/editor-wIndow";
import { createVisualizerWindow } from "./windows/visualizer-window";

export const userDataPath = app.getPath("userData");

initSentry();

// 残像防止
app.disableHardwareAcceleration();

let editorWindow: BrowserWindow | null;
let visualizerWindow: BrowserWindow | null;

uIOhook.on("input", (event) => {
  visualizerWindow?.webContents.send("input", event);
});

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

protocol.registerSchemesAsPrivileged([
  {
    scheme: "media",
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true
    }
  }
]);

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
  visualizerWindow.removeAllListeners();
  editorWindow = null;
  visualizerWindow = null;
});

app
  .whenReady()
  .then(setMenu)
  .then(() => {
    editorWindow = createEditorWindow();
    visualizerWindow = createVisualizerWindow();

    visualizerWindow?.on("hide", () => {
      console.log("visualizer:hide");
      uIOhook.stop();
    });
  })
  .then(() => {
    ipcMain.handle("uiohook:start", async () => {
      uIOhook.start();
      return true;
    });

    ipcMain.handle("uiohook:stop", async () => {
      uIOhook.stop();
      return true;
    });

    ipcMain.handle("config:get", async () => {
      return store.getStore();
    });

    ipcMain.handle("config:set", async (_, data) => {
      console.log("set:config", data);
      return store.setStore(data);
    });

    ipcMain.handle("layout:get-all", async () => {
      return store.getStore().layouts || [];
    });

    // save, update
    ipcMain.handle("layout:save", async (_, layout) => {
      return store.setLayout(layout);
    });

    ipcMain.handle("layout:delete", async (_, id) => {
      return store.deleteLayout(id);
    });

    ipcMain.handle("image:save", async (_, data) => {
      const id = nanoid();
      const fileName = saveImage(id, data.imagePath);
      store.createImage(id, fileName);
      return { id, fileName };
    });

    ipcMain.handle("image:delete", async (_, id) => {
      const images = store.getStore().images || [];
      const index = images.findIndex((item) => item.id === id);
      if (index > -1) {
        deleteImage(images[index].fileName);
        images.splice(index, 1);
      }
      return store.setImages(images);
    });

    ipcMain.handle("image:list", async () => {
      return store.getStore().images.map((image) => {
        return { ...image, path: path.join(imagePath, image.fileName) };
      });
    });

    ipcMain.handle(
      "visualizer:start",
      async (
        _,
        options: {
          layoutId: string;
          size: { width: number; height: number };
        }
      ) => {
        visualizerWindow?.setSize(options.size.width, options.size.height);
        visualizerWindow?.show();
        console.log("visualizer:start", options);
        visualizerWindow?.webContents.send("visualizer:start", options);
      }
    );

    ipcMain.handle("visualizer:close", async () => {
      visualizerWindow?.webContents.send("visualizer:close");
      visualizerWindow?.hide();
      visualizerWindow?.setSize(0, 0);
    });

    // media://xxxx.png
    protocol.handle("media", (req) => {
      const mediaPath = req.url.replace("media://", "");
      return net.fetch(`file://${userDataPath}/${mediaPath}`);
    });
  });
