import { app, nativeImage } from "electron";
import path from "path";
import fs from "fs";

export const userDataPath = app.getPath("userData");
export const imagePath = path.join(userDataPath, "images");
const imageFileNamePattern = /^[a-zA-Z0-9_-]+\.png$/;

/**
 * Returns candidate directories for bundled default image assets.
 */
const getDefaultImagePathCandidates = (): string[] => [
  path.resolve(app.getAppPath(), "resources", "default-images"),
  path.resolve(process.cwd(), "resources", "default-images")
];

/**
 * Resolves the default image asset directory for packaged and test launches.
 */
const resolveDefaultImagePath = (): string => {
  const resolvedPath = getDefaultImagePathCandidates().find((candidate) =>
    fs.existsSync(candidate)
  );

  if (!resolvedPath) {
    throw new Error("Default image directory was not found");
  }

  return resolvedPath;
};

const defaultImagePath = resolveDefaultImagePath();

if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

/**
 * Ensures built-in images are present in the user image directory.
 */
function ensureDefaultImages() {
  const files = fs.readdirSync(defaultImagePath);
  files.forEach((file) => {
    const target = path.join(imagePath, file);
    if (!fs.existsSync(target)) {
      fs.copyFileSync(path.join(defaultImagePath, file), target);
    }
  });
}

ensureDefaultImages();

/**
 * Resolves a stored image file name to a path inside the image directory.
 */
export function resolveImageFilePath(name: string): string {
  if (!imageFileNamePattern.test(name)) {
    throw new Error("Invalid image file name");
  }

  const root = path.resolve(imagePath);
  const target = path.resolve(root, name);
  const relative = path.relative(root, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid image file path");
  }

  return target;
}

/**
 * Copies a local image file into the app image directory as a PNG.
 */
export function saveImage(imageId: string, targetImagePath: string) {
  const image = nativeImage.createFromPath(targetImagePath);
  if (image.isEmpty()) {
    throw new Error("Invalid image file");
  }
  const buffer = image.toPNG();
  const fileName = `${imageId}.png`;
  const filePath = resolveImageFilePath(fileName);
  fs.writeFileSync(filePath, buffer);

  return fileName;
}

/**
 * Saves an image buffer into the app image directory as a PNG.
 */
export function saveImageBuffer(
  imageId: string,
  data: ArrayBuffer | Buffer | Uint8Array
) {
  const sourceBuffer =
    data instanceof Buffer
      ? data
      : Buffer.isBuffer(data)
        ? data
        : Buffer.from(data);

  const image = nativeImage.createFromBuffer(sourceBuffer);
  if (image.isEmpty()) {
    throw new Error("Invalid image buffer");
  }
  const buffer = image.toPNG();
  const fileName = `${imageId}.png`;
  const filePath = resolveImageFilePath(fileName);
  fs.writeFileSync(filePath, buffer);

  return fileName;
}

/**
 * Deletes an image file from the app image directory.
 */
export function deleteImage(name: string) {
  fs.unlinkSync(resolveImageFilePath(name));
}

/**
 * Lists absolute paths for images in the app image directory.
 */
export function getImagePathList() {
  return fs
    .readdirSync(imagePath, "utf-8")
    .map((name) => path.join(imagePath, name));
}

/**
 * Reads the size of an image in bytes.
 */
export function getImageSize(name: string) {
  const data = fs.readFileSync(resolveImageFilePath(name));
  return Buffer.byteLength(data);
}
