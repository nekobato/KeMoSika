import { net, protocol } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { imagePath } from "./utils/image";

const imageFileNamePattern = /^[a-zA-Z0-9_-]+\.png$/;

/**
 * Registers media:// as a secure app-local image scheme before app ready.
 */
export const registerMediaSchemePrivileges = (): void => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: "media",
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true
      }
    }
  ]);
};

/**
 * Resolves a media://images/<file>.png URL to a file inside the image store.
 */
export const resolveMediaImagePath = (requestUrl: string): string | null => {
  try {
    const url = new URL(requestUrl);

    if (url.protocol !== "media:" || url.hostname !== "images") {
      return null;
    }

    const fileName = decodeURIComponent(url.pathname).replace(/^\/+/, "");

    if (!imageFileNamePattern.test(fileName)) {
      return null;
    }

    const root = path.resolve(imagePath);
    const target = path.resolve(root, fileName);
    const relative = path.relative(root, target);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return null;
    }

    return target;
  } catch {
    return null;
  }
};

/**
 * Handles media:// image requests without exposing arbitrary local files.
 */
export const registerMediaProtocol = (): void => {
  protocol.handle("media", (request) => {
    const targetPath = resolveMediaImagePath(request.url);

    if (!targetPath) {
      return new Response("Not found", { status: 404 });
    }

    return net.fetch(pathToFileURL(targetPath).toString());
  });
};
