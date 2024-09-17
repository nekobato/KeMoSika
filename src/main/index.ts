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
import path, { join } from "node:path";
import { uIOhook } from "uiohook-napi";
import * as statics from "./static";
import * as store from "./store";
import { initSentry } from "./utils/sentry";
import { deleteImage, getImagePathList, saveImage } from "./utils/image";
import { nanoid } from "nanoid/non-secure";

initSentry();

// 残像防止
app.disableHardwareAcceleration();

let win: BrowserWindow | null;

uIOhook.on("input", (event) => {
  win?.webContents.send("input", event);
});

function setMenu() {
  const template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: "KeMoSika",
      submenu: [
        {
          label: "Config",
          click: () => {
            // openConfig();
          }
        },
        {
          type: "separator"
        },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          }
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

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(statics.resourcesRoot, "icon.png"),
    webPreferences: {
      preload: statics.preload,
      sandbox: false
    },
    width: 800,
    height: 600,
    frame: true,
    transparent: false,
    show: true,
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    trafficLightPosition: { x: 12, y: 12 }
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  console.log("server", statics.serverUrl);
  if (statics.serverUrl) {
    win.loadURL(statics.pageRoot);
  } else {
    win.loadFile(statics.pageRoot);
  }

  if (process.env.NODE_ENV === "development") {
    win.loadURL(statics.pageRoot);
  } else {
    win.loadFile(join(statics.pageRoot));
  }

  if (statics.serverUrl) {
    win.webContents.openDevTools();
  }
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
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {
  uIOhook.stop();
  globalShortcut.unregisterAll();
});

app
  .whenReady()
  .then(setMenu)
  .then(createWindow)
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
      return getImagePathList();
    });

    protocol.handle("media", (req) => {
      const pathToMedia = new URL(req.url).pathname;
      return net.fetch(`file://${pathToMedia}`);
    });
  });
