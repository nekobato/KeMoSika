import { BrowserWindow } from "electron";
import path, { join } from "node:path";
import * as statics from "../static";

const pageName = "/";

export const createEditorWindow = () => {
  const win = new BrowserWindow({
    icon: path.join(statics.resourcesRoot, "icon.png"),
    webPreferences: {
      preload: statics.preload,
      sandbox: false
    },
    width: 800,
    height: 450,
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

  if (statics.isDevelopment) {
    win.loadURL(statics.pageRoot + "#" + pageName);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(join(statics.pageRoot), { hash: pageName });
  }

  return win;
};
