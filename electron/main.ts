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
import {} from "./store";

// 残像防止
app.disableHardwareAcceleration();

let win: BrowserWindow | null;
let isVisible = false;
let isAnimation = false;

function setMenu() {
  const template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: "TTurns",
      submenu: [
        {
          label: "Config",
          click: () => {
            openConfig();
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
    icon: path.join(statics.publicRoot, "icon.png"),
    webPreferences: {
      preload: statics.preload
    },
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    show: false,
    roundedCorners: false
  });

  const { workArea } = require("electron").screen.getPrimaryDisplay();
  win.setBounds({
    x: workArea.x,
    y: workArea.y,
    width: workArea.width,
    height: workArea.height
  });
  win.setVisibleOnAllWorkspaces(true);

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (statics.VITE_DEV_SERVER_URL) {
    win.loadURL(statics.pageRoot);
  } else {
    win.loadFile(statics.pageRoot);
  }
  win.setIgnoreMouseEvents(true);
  if (statics.VITE_DEV_SERVER_URL) {
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
    const config = getConfig();

    ipcMain.on("open-path", (_, path) => {
      if (path) {
        win?.webContents.send("ring:close");
        isVisible = false;
        shell.openPath(path);
      }
    });
  });
