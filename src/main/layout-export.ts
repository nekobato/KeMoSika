import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { strToU8, zipSync, type Zippable } from "fflate";
import type {
  KeyboardKeyData,
  LayoutData,
  LayoutItemData,
  LayoutItemImage,
  MouseData
} from "@shared/types";
import { resolveImageFilePath } from "./utils/image";

export const layoutExportAppName = "KeMoSika";
export const layoutExportSchemaVersion = 1;
export const layoutExportExtension = ".kemosika-layout";
const zipMtime = new Date("1980-01-01T00:00:00.000Z");
const imageIdPattern = /^[a-zA-Z0-9_-]+$/;
const defaultBackground: LayoutData["background"] = {
  color: "#252525",
  image: ""
};

export type LayoutExportImageFile = {
  id: string;
  fileName: string;
  path: string;
};

export type LayoutExportManifest = {
  schemaVersion: typeof layoutExportSchemaVersion;
  app: typeof layoutExportAppName;
  exportedAt: string;
  layout: {
    id: string;
    name: string;
    width: number;
    height: number;
    itemCount: number;
  };
  files: {
    layout: "layout.json";
    images: LayoutExportImageFile[];
  };
};

type ResolvedExportImage = LayoutExportImageFile & {
  data: Uint8Array;
};

export type LayoutExportArchiveInput = {
  layout: LayoutData;
  images: LayoutItemImage[];
  outputPath: string;
  exportedAt?: Date;
};

export type LayoutExportArchiveResult = {
  filePath: string;
  imageCount: number;
};

/**
 * Returns a filesystem-friendly export file name for a layout.
 */
export const createLayoutExportFileName = (layoutName: string): string => {
  const sanitized = layoutName
    .normalize("NFKC")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\.+$/g, "")
    .slice(0, 80);

  return `${sanitized || "layout"}${layoutExportExtension}`;
};

/**
 * Ensures that an export target uses the app-specific layout extension.
 */
export const ensureLayoutExportFilePath = (filePath: string): string => {
  const extension = path.extname(filePath);
  if (extension) return filePath;
  return `${filePath}${layoutExportExtension}`;
};

/**
 * Collects image identifiers referenced by a layout.
 */
export const collectLayoutImageIds = (layout: LayoutData): string[] => {
  const imageIds = new Set<string>();

  const addImageId = (imageId: string): void => {
    if (!imageId) return;
    if (!imageIdPattern.test(imageId)) {
      throw new Error(`Invalid layout image id: ${imageId}`);
    }
    imageIds.add(imageId);
  };

  addImageId(layout.background?.image ?? "");
  layout.keys.forEach((item) => collectLayoutItemImageIds(item, addImageId));

  return [...imageIds];
};

/**
 * Writes a self-contained layout archive containing layout data and images.
 */
export const writeLayoutExportArchive = async ({
  layout,
  images,
  outputPath,
  exportedAt = new Date()
}: LayoutExportArchiveInput): Promise<LayoutExportArchiveResult> => {
  const normalizedLayout = normalizeLayoutForExport(layout);
  const targetPath = ensureLayoutExportFilePath(outputPath);
  const referencedImages = await resolveReferencedImages(
    collectLayoutImageIds(normalizedLayout),
    images
  );
  const manifest = createManifest(normalizedLayout, referencedImages, exportedAt);
  const archive = createArchive(normalizedLayout, manifest, referencedImages);

  await writeFile(targetPath, archive);

  return {
    filePath: targetPath,
    imageCount: referencedImages.length
  };
};

/**
 * Adds archive-safe defaults for layouts saved by older app versions.
 */
const normalizeLayoutForExport = (layout: LayoutData): LayoutData => ({
  ...layout,
  background: {
    color: layout.background?.color ?? defaultBackground.color,
    image: layout.background?.image ?? defaultBackground.image
  }
});

/**
 * Collects image identifiers from a single layout item.
 */
const collectLayoutItemImageIds = (
  item: LayoutItemData,
  addImageId: (imageId: string) => void
): void => {
  if (item.type === "key") {
    collectKeyImageIds(item, addImageId);
    return;
  }

  collectMouseImageIds(item, addImageId);
};

/**
 * Collects image identifiers from a keyboard key.
 */
const collectKeyImageIds = (
  item: KeyboardKeyData,
  addImageId: (imageId: string) => void
): void => {
  addImageId(item.images.keyDefault);
  addImageId(item.images.keyActive);
  addImageId(item.images.keyLocked);
};

/**
 * Collects image identifiers from a mouse item.
 */
const collectMouseImageIds = (
  item: MouseData,
  addImageId: (imageId: string) => void
): void => {
  addImageId(item.images.mouseDefault);
  addImageId(item.images.mouseLeftClick);
  addImageId(item.images.mouseRightClick);
  addImageId(item.images.mouseMiddleClick);
  addImageId(item.images.mouseScrollUp);
  addImageId(item.images.mouseScrollDown);
  addImageId(item.ring.images.ring);
  addImageId(item.ring.images.pointer);
  addImageId(item.buttonOverlays.left.default);
  addImageId(item.buttonOverlays.left.active);
  addImageId(item.buttonOverlays.right.default);
  addImageId(item.buttonOverlays.right.active);
  addImageId(item.buttonOverlays.middle.default);
  addImageId(item.buttonOverlays.middle.active);
};

/**
 * Resolves image identifiers to archive entries and reads their PNG data.
 */
const resolveReferencedImages = async (
  imageIds: string[],
  images: LayoutItemImage[]
): Promise<ResolvedExportImage[]> => {
  const imageById = new Map(images.map((image) => [image.id, image]));
  const resolvedImages = await Promise.all(
    imageIds.map(async (imageId) => {
      const fileName = imageById.get(imageId)?.fileName ?? `${imageId}.png`;
      const filePath = resolveImageFilePath(fileName);

      try {
        const data = await readFile(filePath);
        return {
          id: imageId,
          fileName,
          path: `images/${fileName}`,
          data
        };
      } catch {
        return null;
      }
    })
  );
  const missingImageIds = imageIds.filter((_, index) => !resolvedImages[index]);

  if (missingImageIds.length) {
    throw new Error(`Missing layout images: ${missingImageIds.join(", ")}`);
  }

  return resolvedImages.filter(
    (image): image is ResolvedExportImage => image !== null
  );
};

/**
 * Creates the archive manifest metadata.
 */
const createManifest = (
  layout: LayoutData,
  images: LayoutExportImageFile[],
  exportedAt: Date
): LayoutExportManifest => ({
  schemaVersion: layoutExportSchemaVersion,
  app: layoutExportAppName,
  exportedAt: exportedAt.toISOString(),
  layout: {
    id: layout.id,
    name: layout.name,
    width: layout.width,
    height: layout.height,
    itemCount: layout.keys.length
  },
  files: {
    layout: "layout.json",
    images: images.map(({ id, fileName, path }) => ({ id, fileName, path }))
  }
});

/**
 * Creates ZIP bytes for a layout export archive.
 */
const createArchive = (
  layout: LayoutData,
  manifest: LayoutExportManifest,
  images: ResolvedExportImage[]
): Uint8Array => {
  const entries: Zippable = {
    "manifest.json": toJsonFile(manifest),
    "layout.json": toJsonFile(layout)
  };

  images.forEach((image) => {
    entries[image.path] = [image.data, { level: 0 }];
  });

  return zipSync(entries, {
    level: 6,
    mtime: zipMtime
  });
};

/**
 * Serializes a value as stable UTF-8 JSON file content.
 */
const toJsonFile = (value: unknown): Uint8Array =>
  strToU8(`${JSON.stringify(value, null, 2)}\n`);
