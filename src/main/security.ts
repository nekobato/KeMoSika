import type { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { pathToFileURL } from "node:url";
import * as statics from "./static";

const rendererFileUrl = pathToFileURL(statics.pageRoot);
const devServerOrigin = statics.serverUrl
  ? new URL(statics.serverUrl).origin
  : null;

/**
 * Returns whether the given URL is one of this app's renderer entry URLs.
 */
export const isAllowedRendererUrl = (targetUrl: string): boolean => {
  try {
    const url = new URL(targetUrl);

    if (devServerOrigin) {
      return url.origin === devServerOrigin;
    }

    return (
      url.protocol === "file:" &&
      url.pathname === rendererFileUrl.pathname
    );
  } catch {
    return false;
  }
};

/**
 * Throws when an IPC invocation does not originate from the app renderer.
 */
export const assertAllowedIpcSender = (event: IpcMainInvokeEvent): void => {
  const senderUrl = event.senderFrame?.url || event.sender.getURL();

  if (!isAllowedRendererUrl(senderUrl)) {
    throw new Error(`Blocked IPC from untrusted renderer: ${senderUrl}`);
  }
};

/**
 * Prevents app windows from navigating away from the trusted renderer entry.
 */
export const installNavigationGuards = (win: BrowserWindow): void => {
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  win.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedRendererUrl(url)) {
      event.preventDefault();
    }
  });
};
