import {
  BrowserWindow,
  app,
  globalShortcut,
  ipcMain,
  shell,
  type MenuItem,
  type MenuItemConstructorOptions
} from "electron";
import { nanoid } from "nanoid/non-secure";
import path from "node:path";
import * as statics from "./static";
import { uIOhook } from "uiohook-napi";
import {} from "./store";

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
      label: "TTurns",
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

  const { Menu } = require("electron");
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(statics.resourcesRoot, "icon.png"),
    webPreferences: {
      preload: statics.preload
    },
    width: 800,
    height: 600,
    frame: true,
    transparent: true,
    show: true,
    roundedCorners: false
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

  if (statics.serverUrl) {
    win.webContents.openDevTools();
  }
}

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
  globalShortcut.unregisterAll();
});

app
  .whenReady()
  .then(setMenu)
  .then(createWindow)
  .then(() => {
    setInputMonitor();
  });
