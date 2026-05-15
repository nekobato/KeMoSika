import type {
  ConfigData,
  ImageSaveBufferInput,
  LayoutExportInput,
  LayoutImportArchiveInput,
  LayoutImportPathInput,
  VisualizerStartOptions
} from "@shared/app-api";
import type { LayoutData, LayoutItemData } from "@shared/types";

const maxIdLength = 128;
const maxTextLength = 10_000;
const maxImageBufferBytes = 10 * 1024 * 1024;
const maxImportArchiveBufferBytes = 100 * 1024 * 1024;
const maxCanvasSize = 4096;
const imageFileNamePattern = /^[a-zA-Z0-9_-]+\.png$/;
const defaultBackground: LayoutData["background"] = {
  color: "#252525",
  image: ""
};

/**
 * Returns whether the value is a non-null object with string keys.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Throws an IPC payload validation error when the condition is false.
 */
function assertPayload(
  condition: boolean,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(`Invalid IPC payload: ${message}`);
  }
}

/**
 * Asserts that a value is a bounded string.
 */
function assertString(
  value: unknown,
  fieldName: string,
  maxLength = maxTextLength
): asserts value is string {
  assertPayload(typeof value === "string", `${fieldName} must be a string`);
  assertPayload(value.length <= maxLength, `${fieldName} is too long`);
}

/**
 * Asserts that a value is a finite number inside an allowed range.
 */
function assertNumber(
  value: unknown,
  fieldName: string,
  min = -maxCanvasSize,
  max = maxCanvasSize
): asserts value is number {
  assertPayload(typeof value === "number", `${fieldName} must be a number`);
  assertPayload(Number.isFinite(value), `${fieldName} must be finite`);
  assertPayload(value >= min && value <= max, `${fieldName} is out of range`);
}

/**
 * Asserts that a value is an optional boolean.
 */
function assertOptionalBoolean(
  value: unknown,
  fieldName: string
): asserts value is boolean | undefined {
  assertPayload(
    value === undefined || typeof value === "boolean",
    `${fieldName} must be a boolean`
  );
}

/**
 * Asserts that a value is an array of bounded strings.
 */
function assertStringArray(
  value: unknown,
  fieldName: string
): asserts value is string[] {
  assertPayload(Array.isArray(value), `${fieldName} must be an array`);
  value.forEach((item, index) => assertString(item, `${fieldName}[${index}]`));
}

/**
 * Asserts that a value is a safe image file name.
 */
function assertImageFileName(value: unknown, fieldName: string): void {
  assertString(value, fieldName, maxIdLength);
  assertPayload(
    imageFileNamePattern.test(value),
    `${fieldName} must be a PNG file name`
  );
}

/**
 * Asserts that a value is a persisted image metadata record.
 */
function assertImageRecord(
  value: unknown,
  fieldName: string
): asserts value is ConfigData["images"][number] {
  assertPayload(isRecord(value), `${fieldName} must be an object`);
  assertString(value.id, `${fieldName}.id`, maxIdLength);
  assertImageFileName(value.fileName, `${fieldName}.fileName`);
}

/**
 * Asserts that a value is a layout background object.
 */
function assertBackground(
  value: unknown,
  fieldName: string
): asserts value is LayoutData["background"] {
  assertPayload(isRecord(value), `${fieldName} must be an object`);
  assertString(value.color, `${fieldName}.color`);
  assertString(value.image, `${fieldName}.image`, maxIdLength);
}

/**
 * Asserts that a value is a key image reference object.
 */
function assertKeyImages(
  value: unknown,
  fieldName: string
): asserts value is Extract<LayoutItemData, { type: "key" }>["images"] {
  assertPayload(isRecord(value), `${fieldName} must be an object`);
  assertString(value.keyDefault, `${fieldName}.keyDefault`, maxIdLength);
  assertString(value.keyActive, `${fieldName}.keyActive`, maxIdLength);
  assertString(value.keyLocked ?? "", `${fieldName}.keyLocked`, maxIdLength);
}

/**
 * Asserts that a value is a mouse image reference object.
 */
function assertMouseImages(
  value: unknown,
  fieldName: string
): asserts value is Extract<LayoutItemData, { type: "mouse" }>["images"] {
  assertPayload(isRecord(value), `${fieldName} must be an object`);
  assertString(value.mouseDefault, `${fieldName}.mouseDefault`, maxIdLength);
  assertString(value.mouseLeftClick, `${fieldName}.mouseLeftClick`, maxIdLength);
  assertString(value.mouseRightClick, `${fieldName}.mouseRightClick`, maxIdLength);
  assertString(
    value.mouseMiddleClick,
    `${fieldName}.mouseMiddleClick`,
    maxIdLength
  );
  assertString(value.mouseScrollUp, `${fieldName}.mouseScrollUp`, maxIdLength);
  assertString(value.mouseScrollDown, `${fieldName}.mouseScrollDown`, maxIdLength);
}

/**
 * Asserts that a value is a mouse button overlay image object.
 */
function assertButtonOverlays(
  value: unknown,
  fieldName: string
): asserts value is Extract<
  LayoutItemData,
  { type: "mouse" }
>["buttonOverlays"] {
  assertPayload(isRecord(value), `${fieldName} must be an object`);

  ["left", "right", "middle"].forEach((button) => {
    const overlay = value[button];
    assertPayload(isRecord(overlay), `${fieldName}.${button} must be an object`);
    assertString(overlay.default, `${fieldName}.${button}.default`, maxIdLength);
    assertString(overlay.active, `${fieldName}.${button}.active`, maxIdLength);
  });
}

/**
 * Asserts that a value is a mouse ring setting object.
 */
function assertMouseRing(
  value: unknown,
  fieldName: string
): asserts value is Extract<LayoutItemData, { type: "mouse" }>["ring"] {
  assertPayload(isRecord(value), `${fieldName} must be an object`);
  assertNumber(value.size, `${fieldName}.size`, 0, maxCanvasSize);
  assertString(value.color, `${fieldName}.color`);
  assertPayload(isRecord(value.images), `${fieldName}.images must be an object`);
  assertString(value.images.ring, `${fieldName}.images.ring`, maxIdLength);
  assertString(value.images.pointer, `${fieldName}.images.pointer`, maxIdLength);
}

/**
 * Asserts that a value is a text overlay object when present.
 */
function assertOptionalText(value: unknown, fieldName: string): void {
  if (value === undefined) return;

  assertPayload(isRecord(value), `${fieldName} must be an object`);
  assertOptionalBoolean(value.isVisible, `${fieldName}.isVisible`);
  assertString(value.character, `${fieldName}.character`);
  if (value.x !== undefined) assertNumber(value.x, `${fieldName}.x`);
  if (value.y !== undefined) assertNumber(value.y, `${fieldName}.y`);
  assertNumber(value.size, `${fieldName}.size`, 0, maxCanvasSize);
  assertString(value.color, `${fieldName}.color`);
  if (value.font !== undefined) assertString(value.font, `${fieldName}.font`);
}

/**
 * Asserts that a value is a keyboard or mouse layout item.
 */
function assertLayoutItem(
  value: unknown,
  fieldName: string
): asserts value is LayoutItemData {
  assertPayload(isRecord(value), `${fieldName} must be an object`);
  assertString(value.id, `${fieldName}.id`, maxIdLength);
  assertPayload(
    value.type === "key" || value.type === "mouse",
    `${fieldName}.type must be key or mouse`
  );
  assertNumber(value.width, `${fieldName}.width`, 1, maxCanvasSize);
  assertNumber(value.height, `${fieldName}.height`, 1, maxCanvasSize);
  assertNumber(value.x, `${fieldName}.x`);
  assertNumber(value.y, `${fieldName}.y`);
  assertNumber(value.rotation, `${fieldName}.rotation`, -360, 360);
  assertOptionalBoolean(value.shadow, `${fieldName}.shadow`);

  if (value.type === "key") {
    assertStringArray(value.codeMap, `${fieldName}.codeMap`);
    assertKeyImages(value.images, `${fieldName}.images`);
    assertOptionalText(value.text, `${fieldName}.text`);
    return;
  }

  assertButtonOverlays(value.buttonOverlays, `${fieldName}.buttonOverlays`);
  assertMouseRing(value.ring, `${fieldName}.ring`);
  assertMouseImages(value.images, `${fieldName}.images`);
}

/**
 * Asserts that a value is a complete layout.
 */
function assertLayoutData(
  value: unknown,
  fieldName: string
): asserts value is LayoutData {
  assertPayload(isRecord(value), `${fieldName} must be an object`);
  assertString(value.id, `${fieldName}.id`, maxIdLength);
  assertString(value.name, `${fieldName}.name`);
  assertNumber(value.width, `${fieldName}.width`, 1, maxCanvasSize);
  assertNumber(value.height, `${fieldName}.height`, 1, maxCanvasSize);
  assertBackground(value.background, `${fieldName}.background`);
  assertPayload(Array.isArray(value.keys), `${fieldName}.keys must be an array`);
  value.keys.forEach((item, index) => {
    assertLayoutItem(item, `${fieldName}.keys[${index}]`);
  });
}

/**
 * Adds default fields that may be absent from older persisted layouts.
 */
function normalizeLayoutPayload(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;

  const background = isRecord(payload.background)
    ? {
        color: payload.background.color ?? defaultBackground.color,
        image: payload.background.image ?? defaultBackground.image
      }
    : defaultBackground;

  return {
    ...payload,
    background
  };
}

/**
 * Parses an IPC payload as app config data.
 */
export function parseConfigData(payload: unknown): ConfigData {
  assertPayload(isRecord(payload), "config must be an object");
  assertPayload(Array.isArray(payload.layouts), "config.layouts must be an array");
  assertPayload(Array.isArray(payload.images), "config.images must be an array");
  const layouts = payload.layouts.map((layout) => normalizeLayoutPayload(layout));

  layouts.forEach((layout, index) => {
    assertLayoutData(layout, `config.layouts[${index}]`);
  });
  payload.images.forEach((image, index) => {
    assertImageRecord(image, `config.images[${index}]`);
  });

  return {
    layouts: layouts as LayoutData[],
    images: payload.images as ConfigData["images"]
  };
}

/**
 * Parses an IPC payload as a layout.
 */
export function parseLayoutData(payload: unknown): LayoutData {
  const layout = normalizeLayoutPayload(payload);
  assertLayoutData(layout, "layout");
  return layout;
}

/**
 * Parses an IPC payload as a layout export request.
 */
export function parseLayoutExportInput(payload: unknown): LayoutExportInput {
  assertPayload(isRecord(payload), "layout export input must be an object");
  assertString(payload.layoutId, "layoutExport.layoutId", maxIdLength);
  return payload as LayoutExportInput;
}

/**
 * Parses an IPC payload as a layout import path request.
 */
export function parseLayoutImportPathInput(
  payload: unknown
): LayoutImportPathInput {
  assertPayload(isRecord(payload), "layout import path input must be an object");
  assertString(payload.path, "layoutImport.path");
  return payload as LayoutImportPathInput;
}

/**
 * Parses an IPC payload as a layout import archive request.
 */
export function parseLayoutImportArchiveInput(
  payload: unknown
): LayoutImportArchiveInput {
  assertPayload(isRecord(payload), "layout import archive input must be an object");
  assertString(payload.fileName, "layoutImport.fileName");

  const buffer = payload.buffer;
  const byteLength =
    buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer)
      ? buffer.byteLength
      : null;

  assertPayload(byteLength !== null, "layout import archive buffer is required");
  assertPayload(byteLength > 0, "layout import archive buffer must not be empty");
  assertPayload(
    byteLength <= maxImportArchiveBufferBytes,
    "layout import archive buffer exceeds the maximum size"
  );

  return payload as LayoutImportArchiveInput;
}

/**
 * Parses an IPC payload as a bounded string identifier.
 */
export function parseId(payload: unknown, fieldName = "id"): string {
  assertString(payload, fieldName, maxIdLength);
  return payload;
}

/**
 * Parses an IPC payload as image buffer save input.
 */
export function parseImageSaveBufferInput(
  payload: unknown
): ImageSaveBufferInput {
  assertPayload(isRecord(payload), "image input must be an object");

  const buffer = payload.buffer;
  const byteLength =
    buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer)
      ? buffer.byteLength
      : null;

  assertPayload(byteLength !== null, "image buffer is required");
  assertPayload(byteLength > 0, "image buffer must not be empty");
  assertPayload(
    byteLength <= maxImageBufferBytes,
    "image buffer exceeds the maximum size"
  );

  return payload as ImageSaveBufferInput;
}

/**
 * Parses an IPC payload as visualizer start options.
 */
export function parseVisualizerStartOptions(
  payload: unknown
): VisualizerStartOptions {
  assertPayload(isRecord(payload), "visualizer options must be an object");
  assertString(payload.layoutId, "visualizer.layoutId", maxIdLength);
  assertPayload(isRecord(payload.size), "visualizer.size must be an object");
  assertNumber(payload.size.width, "visualizer.size.width", 1, maxCanvasSize);
  assertNumber(payload.size.height, "visualizer.size.height", 1, maxCanvasSize);
  assertPayload(
    Number.isInteger(payload.size.width) && Number.isInteger(payload.size.height),
    "visualizer size must use integer pixels"
  );

  return payload as VisualizerStartOptions;
}
