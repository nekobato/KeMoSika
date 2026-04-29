import type {
  ConfigData,
  ImageSaveBufferInput,
  VisualizerStartOptions
} from "@shared/app-api";
import type { LayoutData, LayoutItemData } from "@shared/types";

const maxIdLength = 128;
const maxTextLength = 10_000;
const maxImageBufferBytes = 10 * 1024 * 1024;
const maxCanvasSize = 4096;
const imageFileNamePattern = /^[a-zA-Z0-9_-]+\.png$/;

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
 * Parses an IPC payload as app config data.
 */
export function parseConfigData(payload: unknown): ConfigData {
  assertPayload(isRecord(payload), "config must be an object");
  assertPayload(Array.isArray(payload.layouts), "config.layouts must be an array");
  assertPayload(Array.isArray(payload.images), "config.images must be an array");
  payload.layouts.forEach((layout, index) => {
    assertLayoutData(layout, `config.layouts[${index}]`);
  });
  payload.images.forEach((image, index) => {
    assertImageRecord(image, `config.images[${index}]`);
  });

  return payload as ConfigData;
}

/**
 * Parses an IPC payload as a layout.
 */
export function parseLayoutData(payload: unknown): LayoutData {
  assertLayoutData(payload, "layout");
  return payload;
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
