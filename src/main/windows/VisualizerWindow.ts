import { BrowserWindow } from "electron";
import path, { join } from "node:path";
import * as statics from "../static";

const pageName = "/visualizer";

export const createVisualizerWindow = () => {
  const win = new BrowserWindow({
    icon: path.join(statics.resourcesRoot, "icon.png"),
    webPreferences: {
      preload: statics.preload,
      sandbox: false
    },
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    show: false
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (statics.isDevelopment) {
    win.loadURL(statics.pageRoot + "#" + pageName);
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(statics.pageRoot), { hash: pageName });
  }

  return win;
};
