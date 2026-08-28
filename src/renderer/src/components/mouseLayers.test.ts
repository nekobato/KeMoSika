/**
 * Tests the two-layer mouse image composition rules.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_MOUSE_BASE_IMAGE_ID,
  DEFAULT_MOUSE_BUTTON_IMAGE_IDS,
  resolveMouseVisualLayers,
  type MouseButtonOverlays
} from "./mouseLayers.ts";

const buttonOverlays: MouseButtonOverlays = {
  left: { default: "left-default", active: "left-active" },
  right: { default: "right-default", active: "right-active" },
  middle: { default: "middle-default", active: "middle-active" },
  x1: { default: "x1-default", active: "x1-active" },
  x2: { default: "x2-default", active: "x2-active" }
};

const fallbackButtonImageIds = {
  left: "fallback-left-active",
  right: "fallback-right-active",
  middle: "fallback-middle-active",
  x1: "fallback-x1-active",
  x2: "fallback-x2-active"
};

/** Reads the canvas metadata stored in a bundled PNG's IHDR chunk. */
const readBundledPngMetadata = (imageId: string) => {
  const file = readFileSync(
    new URL(`../../../../resources/default-images/${imageId}.png`, import.meta.url)
  );

  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
    colorType: file[25]
  };
};

test("bundles one generated RGBA canvas for the body and every button layer", () => {
  const imageIds = [
    DEFAULT_MOUSE_BASE_IMAGE_ID,
    ...Object.values(DEFAULT_MOUSE_BUTTON_IMAGE_IDS)
  ];

  assert.deepEqual(imageIds.map(readBundledPngMetadata), [
    { width: 240, height: 320, colorType: 6 },
    { width: 240, height: 320, colorType: 6 },
    { width: 240, height: 320, colorType: 6 },
    { width: 240, height: 320, colorType: 6 },
    { width: 240, height: 320, colorType: 6 },
    { width: 240, height: 320, colorType: 6 }
  ]);
});

test("keeps the base image fixed while composing simultaneous button presses", () => {
  const layers = resolveMouseVisualLayers({
    baseImageId: "custom-mouse-body",
    fallbackBaseImageId: "default-mouse-body",
    fallbackButtonImageIds,
    buttonOverlays,
    pressedButtons: [1, 2]
  });

  assert.deepEqual(layers, {
    baseImageId: "custom-mouse-body",
    buttonLayers: [
      { button: "left", imageId: "left-active" },
      { button: "right", imageId: "right-active" }
    ]
  });
});

test("renders no button layers while all buttons are released", () => {
  const layers = resolveMouseVisualLayers({
    baseImageId: "",
    fallbackBaseImageId: "default-mouse-body",
    fallbackButtonImageIds,
    buttonOverlays,
    pressedButtons: []
  });

  assert.deepEqual(layers, {
    baseImageId: "default-mouse-body",
    buttonLayers: []
  });
});

test("uses a transparent fallback for a pressed button when active is unset", () => {
  const layers = resolveMouseVisualLayers({
    baseImageId: "",
    fallbackBaseImageId: "default-mouse-body",
    fallbackButtonImageIds,
    buttonOverlays: {
      ...buttonOverlays,
      left: { default: "left-default", active: "" }
    },
    pressedButtons: [1]
  });

  assert.deepEqual(layers.buttonLayers, [
    { button: "left", imageId: "fallback-left-active" }
  ]);
});

test("uses a transparent fallback when the bundled body is selected explicitly", () => {
  const layers = resolveMouseVisualLayers({
    baseImageId: "default-mouse-body",
    fallbackBaseImageId: "default-mouse-body",
    fallbackButtonImageIds,
    buttonOverlays: {
      ...buttonOverlays,
      right: { default: "right-default", active: "" }
    },
    pressedButtons: [2]
  });

  assert.deepEqual(layers.buttonLayers, [
    { button: "right", imageId: "fallback-right-active" }
  ]);
});

test("does not apply a bundled button fallback to a custom body", () => {
  const layers = resolveMouseVisualLayers({
    baseImageId: "custom-mouse-body",
    fallbackBaseImageId: "default-mouse-body",
    fallbackButtonImageIds,
    buttonOverlays: {
      ...buttonOverlays,
      left: { default: "left-default", active: "" }
    },
    pressedButtons: [1]
  });

  assert.deepEqual(layers.buttonLayers, []);
});

test("renders each supported button once and ignores unknown button codes", () => {
  const layers = resolveMouseVisualLayers({
    baseImageId: "custom-mouse-body",
    fallbackBaseImageId: "default-mouse-body",
    fallbackButtonImageIds,
    buttonOverlays,
    pressedButtons: [1, 1, 2, 3, 4, 5]
  });

  assert.deepEqual(layers.buttonLayers, [
    { button: "left", imageId: "left-active" },
    { button: "right", imageId: "right-active" },
    { button: "middle", imageId: "middle-active" },
    { button: "x1", imageId: "x1-active" },
    { button: "x2", imageId: "x2-active" }
  ]);
});
