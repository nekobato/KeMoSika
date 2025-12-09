import { app, nativeImage } from "electron";
import path from "path";
import fs from "fs";

export const userDataPath = app.getPath("userData");
export const imagePath = path.join(userDataPath, "images");
const defaultImagePath = path.resolve(
  app.getAppPath(),
  "resources",
  "default-images"
);

if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

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

export function saveImage(imageId: string, targetImagePath: string) {
  const image = nativeImage.createFromPath(targetImagePath);
  const buffer = image.toPNG();
  const fileName = `${imageId}.png`;
  const filePath = path.join(imagePath, fileName);
  fs.writeFileSync(filePath, buffer);

  return fileName;
}

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
  const buffer = image.toPNG();
  const fileName = `${imageId}.png`;
  const filePath = path.join(imagePath, fileName);
  fs.writeFileSync(filePath, buffer);

  return fileName;
}

export function deleteImage(name: string) {
  fs.unlinkSync(path.join(imagePath, name));
}

export function getImagePathList() {
  return fs
    .readdirSync(imagePath, "utf-8")
    .map((name) => path.join(imagePath, name));
}

export function getImageSize(name: string) {
  const data = fs.readFileSync(path.join(imagePath, name));
  return Buffer.byteLength(data);
}
