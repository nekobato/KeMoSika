import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { strFromU8, unzipSync } from "fflate";
import type {
  KeyboardKeyData,
  LayoutData,
  LayoutItemData,
  MouseData
} from "@shared/types";
import {
  collectLayoutImageIds,
  layoutExportAppName,
  layoutExportExtension,
  layoutExportSchemaVersion,
  type LayoutExportImageFile,
  type LayoutExportManifest
} from "./layout-export";
import { parseLayoutData } from "./validation";

const manifestFileName = "manifest.json";
const layoutFileName = "layout.json";
const maxImportTextLength = 10 * 1024 * 1024;
const imageIdPattern = /^[a-zA-Z0-9_-]+$/;
const imagePathPattern = /^images\/[a-zA-Z0-9_-]+\.png$/;
const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const archiveExtensions = new Set([layoutExportExtension, ".zip"]);

export type LayoutImportSourceType = "archive" | "directory";

export type LayoutImportImage = LayoutExportImageFile & {
  data: Uint8Array;
};

export type LayoutImportPackage = {
  sourceType: LayoutImportSourceType;
  layout: LayoutData;
  images: LayoutImportImage[];
};

export type PreparedLayoutImportImage = {
  id: string;
  data: Uint8Array;
};

export type PreparedLayoutImport = {
  layout: LayoutData;
  images: PreparedLayoutImportImage[];
};

type LayoutImportPrepareInput = {
  sourcePackage: LayoutImportPackage;
  existingLayouts: LayoutData[];
  createId: () => string;
};

/**
 * Reads and validates a layout import package from a filesystem path.
 */
export const readLayoutImportPackageFromPath = async (
  sourcePath: string
): Promise<LayoutImportPackage> => {
  const sourceStat = await stat(sourcePath).catch(() => {
    throw new Error("指定されたインポート元が見つかりません。");
  });

  if (sourceStat.isDirectory()) {
    return await readLayoutImportPackageFromDirectory(sourcePath);
  }

  if (sourceStat.isFile()) {
    const extension = path.extname(sourcePath).toLowerCase();
    if (!archiveExtensions.has(extension)) {
      throw new Error("対応していないインポートファイルです。");
    }

    return readLayoutImportPackageFromArchive(
      new Uint8Array(await readFile(sourcePath)),
      path.basename(sourcePath)
    );
  }

  throw new Error("対応していないインポート元です。");
};

/**
 * Reads and validates a layout import package from ZIP archive bytes.
 */
export const readLayoutImportPackageFromArchive = (
  archiveData: ArrayBuffer | Uint8Array,
  fileName: string
): LayoutImportPackage => {
  if (fileName) {
    const extension = path.extname(fileName).toLowerCase();
    if (!archiveExtensions.has(extension)) {
      throw new Error("対応していないインポートファイルです。");
    }
  }

  const archive = unzipArchive(toUint8Array(archiveData));
  const manifest = parseManifestEntry(archive[manifestFileName]);
  const layout = parseLayoutEntry(archive[manifest.files.layout]);
  const images = manifest.files.images.map((image) => {
    const data = archive[image.path];
    if (!data) {
      throw new Error(`画像ファイル ${image.path} が見つかりません。`);
    }
    assertPngData(data, image.path);

    return {
      ...image,
      data
    };
  });

  return createValidatedImportPackage("archive", manifest, layout, images);
};

/**
 * Creates an import payload with fresh layout and image identifiers.
 */
export const prepareLayoutImport = ({
  sourcePackage,
  existingLayouts,
  createId
}: LayoutImportPrepareInput): PreparedLayoutImport => {
  const imageIds = collectLayoutImageIds(sourcePackage.layout);
  const imageIdMap = new Map(imageIds.map((imageId) => [imageId, createId()]));
  const layout = replaceLayoutImageIds(
    cloneLayout(sourcePackage.layout),
    imageIdMap
  );

  layout.id = createId();
  layout.name = createImportedLayoutName(layout.name, existingLayouts);

  return {
    layout,
    images: imageIds.map((imageId) => {
      const sourceImage = sourcePackage.images.find(
        (image) => image.id === imageId
      );
      const importedImageId = imageIdMap.get(imageId);
      if (!sourceImage) {
        throw new Error(`画像 ${imageId} が見つかりません。`);
      }
      if (!importedImageId) {
        throw new Error(`画像 ${imageId} の ID を作成できません。`);
      }

      return {
        id: importedImageId,
        data: sourceImage.data
      };
    })
  };
};

/**
 * Reads and validates an unpacked layout export directory.
 */
const readLayoutImportPackageFromDirectory = async (
  directoryPath: string
): Promise<LayoutImportPackage> => {
  const manifest = parseManifestEntry(
    await readFile(path.join(directoryPath, manifestFileName)).catch(() => {
      throw new Error("manifest.json が見つかりません。");
    })
  );
  const layout = parseLayoutEntry(
    await readFile(resolveImportPath(directoryPath, manifest.files.layout))
  );
  const images = await Promise.all(
    manifest.files.images.map(async (image) => {
      const data = await readFile(resolveImportPath(directoryPath, image.path)).catch(
        () => {
          throw new Error(`画像ファイル ${image.path} が見つかりません。`);
        }
      );
      assertPngData(data, image.path);

      return {
        ...image,
        data: new Uint8Array(data)
      };
    })
  );

  return createValidatedImportPackage("directory", manifest, layout, images);
};

/**
 * Converts IPC buffer payloads to a Uint8Array for ZIP parsing.
 */
const toUint8Array = (data: ArrayBuffer | Uint8Array): Uint8Array => {
  if (data instanceof Uint8Array) return data;
  return new Uint8Array(data);
};

/**
 * Unzips archive bytes and converts parser errors into user-facing failures.
 */
const unzipArchive = (archiveData: Uint8Array): Record<string, Uint8Array> => {
  try {
    return unzipSync(archiveData);
  } catch {
    throw new Error("インポートファイルを展開できません。");
  }
};

/**
 * Parses and validates manifest JSON from an import entry.
 */
const parseManifestEntry = (entry?: Uint8Array): LayoutExportManifest => {
  if (!entry) {
    throw new Error("manifest.json が見つかりません。");
  }
  const manifest = parseJsonEntry(entry, manifestFileName);
  assertManifest(manifest);
  return manifest;
};

/**
 * Parses and validates layout JSON from an import entry.
 */
const parseLayoutEntry = (entry?: Uint8Array): LayoutData => {
  if (!entry) {
    throw new Error("layout.json が見つかりません。");
  }
  return parseLayoutData(parseJsonEntry(entry, layoutFileName));
};

/**
 * Parses a UTF-8 JSON file entry with a size guard.
 */
const parseJsonEntry = (entry: Uint8Array, fileName: string): unknown => {
  assertImportPayload(
    entry.byteLength <= maxImportTextLength,
    `${fileName} が大きすぎます。`
  );

  try {
    return JSON.parse(strFromU8(entry));
  } catch {
    throw new Error(`${fileName} の JSON を読み込めません。`);
  }
};

/**
 * Asserts that a parsed manifest matches the supported export schema.
 */
const assertManifest = (value: unknown): asserts value is LayoutExportManifest => {
  assertImportPayload(isRecord(value), "manifest.json が不正です。");
  assertImportPayload(
    value.app === layoutExportAppName,
    "KeMoSika のレイアウトではありません。"
  );
  assertImportPayload(
    value.schemaVersion === layoutExportSchemaVersion,
    "対応していないレイアウト形式です。"
  );
  assertImportPayload(isRecord(value.files), "manifest.json が不正です。");
  assertImportPayload(
    value.files.layout === layoutFileName,
    "layout.json の指定が不正です。"
  );
  assertImportPayload(
    Array.isArray(value.files.images),
    "画像リストの指定が不正です。"
  );

  const imageIds = new Set<string>();
  value.files.images.forEach((image, index) => {
    assertManifestImage(image, `画像リスト[${index}]`);
    assertImportPayload(
      !imageIds.has(image.id),
      `画像 ID ${image.id} が重複しています。`
    );
    imageIds.add(image.id);
  });
};

/**
 * Asserts that one manifest image entry is safe to read.
 */
const assertManifestImage = (
  value: unknown,
  fieldName: string
): asserts value is LayoutExportImageFile => {
  assertImportPayload(isRecord(value), `${fieldName} が不正です。`);
  assertImportPayload(
    typeof value.id === "string" && imageIdPattern.test(value.id),
    `${fieldName} の ID が不正です。`
  );
  assertImportPayload(
    typeof value.fileName === "string" &&
      path.basename(value.fileName) === value.fileName,
    `${fieldName} のファイル名が不正です。`
  );
  assertImportPayload(
    typeof value.path === "string" && imagePathPattern.test(value.path),
    `${fieldName} のパスが不正です。`
  );
};

/**
 * Creates a safe path inside the selected import directory.
 */
const resolveImportPath = (rootPath: string, entryPath: string): string => {
  assertImportPayload(
    entryPath === layoutFileName || imagePathPattern.test(entryPath),
    "インポート元のパスが不正です。"
  );

  const root = path.resolve(rootPath);
  const target = path.resolve(root, entryPath);
  const relative = path.relative(root, target);

  assertImportPayload(
    !relative.startsWith("..") && !path.isAbsolute(relative),
    "インポート元のパスが不正です。"
  );

  return target;
};

/**
 * Checks the PNG file signature before importing an image.
 */
const assertPngData = (data: Uint8Array, fileName: string): void => {
  const hasPngSignature = pngSignature.every(
    (byte, index) => data[index] === byte
  );
  assertImportPayload(hasPngSignature, `${fileName} は PNG 画像ではありません。`);
};

/**
 * Cross-checks manifest images against the layout references.
 */
const createValidatedImportPackage = (
  sourceType: LayoutImportSourceType,
  manifest: LayoutExportManifest,
  layout: LayoutData,
  images: LayoutImportImage[]
): LayoutImportPackage => {
  const manifestImageById = new Map(images.map((image) => [image.id, image]));
  const referencedImageIds = collectLayoutImageIds(layout);
  const missingImageIds = referencedImageIds.filter(
    (imageId) => !manifestImageById.has(imageId)
  );

  assertImportPayload(
    missingImageIds.length === 0,
    `参照画像が見つかりません: ${missingImageIds.join(", ")}`
  );
  assertImportPayload(
    manifest.layout.itemCount === layout.keys.length,
    "manifest.json と layout.json の内容が一致しません。"
  );

  return {
    sourceType,
    layout,
    images: referencedImageIds.map((imageId) => manifestImageById.get(imageId)!)
  };
};

/**
 * Creates a JSON-safe deep copy of layout data.
 */
const cloneLayout = (layout: LayoutData): LayoutData =>
  JSON.parse(JSON.stringify(layout)) as LayoutData;

/**
 * Rewrites all image references in a layout using newly generated image IDs.
 */
const replaceLayoutImageIds = (
  layout: LayoutData,
  imageIdMap: Map<string, string>
): LayoutData => ({
  ...layout,
  background: {
    ...layout.background,
    image: replaceImageId(layout.background.image, imageIdMap)
  },
  keys: layout.keys.map((item) => replaceLayoutItemImageIds(item, imageIdMap))
});

/**
 * Rewrites image references for one layout item.
 */
const replaceLayoutItemImageIds = (
  item: LayoutItemData,
  imageIdMap: Map<string, string>
): LayoutItemData => {
  if (item.type === "key") {
    return replaceKeyImageIds(item, imageIdMap);
  }

  return replaceMouseImageIds(item, imageIdMap);
};

/**
 * Rewrites keyboard key image references.
 */
const replaceKeyImageIds = (
  item: KeyboardKeyData,
  imageIdMap: Map<string, string>
): KeyboardKeyData => ({
  ...item,
  images: {
    keyDefault: replaceImageId(item.images.keyDefault, imageIdMap),
    keyActive: replaceImageId(item.images.keyActive, imageIdMap),
    keyLocked: replaceImageId(item.images.keyLocked, imageIdMap)
  }
});

/**
 * Rewrites mouse image references.
 */
const replaceMouseImageIds = (
  item: MouseData,
  imageIdMap: Map<string, string>
): MouseData => ({
  ...item,
  images: {
    mouseDefault: replaceImageId(item.images.mouseDefault, imageIdMap),
    mouseLeftClick: replaceImageId(item.images.mouseLeftClick, imageIdMap),
    mouseRightClick: replaceImageId(item.images.mouseRightClick, imageIdMap),
    mouseMiddleClick: replaceImageId(item.images.mouseMiddleClick, imageIdMap),
    mouseScrollUp: replaceImageId(item.images.mouseScrollUp, imageIdMap),
    mouseScrollDown: replaceImageId(item.images.mouseScrollDown, imageIdMap)
  },
  ring: {
    ...item.ring,
    images: {
      ring: replaceImageId(item.ring.images.ring, imageIdMap),
      pointer: replaceImageId(item.ring.images.pointer, imageIdMap)
    }
  },
  buttonOverlays: {
    left: {
      default: replaceImageId(item.buttonOverlays.left.default, imageIdMap),
      active: replaceImageId(item.buttonOverlays.left.active, imageIdMap)
    },
    right: {
      default: replaceImageId(item.buttonOverlays.right.default, imageIdMap),
      active: replaceImageId(item.buttonOverlays.right.active, imageIdMap)
    },
    middle: {
      default: replaceImageId(item.buttonOverlays.middle.default, imageIdMap),
      active: replaceImageId(item.buttonOverlays.middle.active, imageIdMap)
    }
  }
});

/**
 * Returns a replacement image ID while preserving empty references.
 */
const replaceImageId = (
  imageId: string,
  imageIdMap: Map<string, string>
): string => {
  if (!imageId) return "";
  return imageIdMap.get(imageId) ?? imageId;
};

/**
 * Creates a layout name that does not collide with existing custom layouts.
 */
const createImportedLayoutName = (
  originalName: string,
  existingLayouts: LayoutData[]
): string => {
  const existingNames = new Set(existingLayouts.map((layout) => layout.name));
  const baseName = originalName.trim() || "Imported Layout";

  if (!existingNames.has(baseName)) return baseName;

  const firstImportedName = `${baseName} (import)`;
  if (!existingNames.has(firstImportedName)) return firstImportedName;

  for (let index = 2; ; index += 1) {
    const importedName = `${baseName} (import ${index})`;
    if (!existingNames.has(importedName)) return importedName;
  }
};

/**
 * Returns whether a parsed value is a plain object-like record.
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Throws a user-facing import validation error when a condition fails.
 */
const assertImportPayload = (
  condition: boolean,
  message: string
): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};
