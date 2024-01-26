import {
  BrowserWindow,
  app,
  globalShortcut,
  type MenuItem,
  type MenuItemConstructorOptions
} from "electron";
import path from "node:path";
import { uIOhook } from "uiohook-napi";
import * as statics from "./static";
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
    width: 400,
    height: 300,
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
  uIOhook.stop();
  globalShortcut.unregisterAll();
});

app
  .whenReady()
  .then(setMenu)
  .then(createWindow)
  .then(() => {
    setInputMonitor();
  });