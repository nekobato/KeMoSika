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
import { getStore, setStore } from "./store";
import { initSentry } from "./utils/sentry";
import { getImagePathList, saveImage } from "./utils/image";

initSentry();

// 残像防止
app.disableHardwareAcceleration();

let win: BrowserWindow | null;

function setInputMonitor() {
  uIOhook.on("keydown", (event) => {
    win?.webContents.send("input:keydown", event);
  });
  uIOhook.on("keyup", (event) => {
    win?.webContents.send("input:keyup", event);
  });
  uIOhook.start();
}

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
    roundedCorners: true
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

  const pageName = "config";

  if (process.env.NODE_ENV === "development") {
    win.loadURL(statics.pageRoot + "#" + pageName);
  } else {
    win.loadFile(join(statics.pageRoot), { hash: pageName });
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
    setInputMonitor();

    ipcMain.handle("config:get", async () => {
      return getStore();
    });

    ipcMain.handle("config:set", async (_, data) => {
      console.log("set:config", data);
      return setStore(data);
    });

    ipcMain.handle("layout:get-all", async () => {
      return getStore().layouts || [];
    });

    ipcMain.handle("layout:create", async (_, data) => {
      const layouts = getStore().layouts || [];
      layouts.push(data);
      return setStore({ layouts });
    });

    ipcMain.handle("layout:save", async (_, data) => {
      const layouts = getStore().layouts || [];
      const exists = layouts.find((item) => item.id === data.id);
      if (exists) {
        exists.keys = data.keys;
      } else {
        layouts.push(data);
      }
      return setStore({ layouts });
    });

    ipcMain.handle("layout:saveName", async (_, data) => {
      const layouts = getStore().layouts || [];
      const exists = layouts.find((item) => item.id === data.id);
      if (exists) {
        exists.name = data.name;
      }
      return setStore({ layouts });
    });

    ipcMain.handle("layout:delete", async (_, id) => {
      const layouts = getStore().layouts || [];
      const index = layouts.findIndex((item) => item.id === id);
      if (index > -1) {
        layouts.splice(index, 1);
      }
      return setStore({ layouts });
    });

    ipcMain.handle("image:save", async (_, data) => {
      return saveImage(data.id, data.status, data.imagePath);
    });

    ipcMain.handle("image:list", async () => {
      return getImagePathList();
    });

    protocol.handle("media", (req) => {
      const pathToMedia = new URL(req.url).pathname;
      return net.fetch(`file://${pathToMedia}`);
    });
  });
