import assert from "node:assert/strict";
import test from "node:test";
import type {
  KeyboardKeyData,
  LayoutItemData,
  MouseData,
} from "../../../shared/types";
import {
  getLayerItemLabel,
  getLayerItems,
  moveLayerItems,
} from "./layerOrder.ts";

const createKey = (
  id: string,
  character = id,
): KeyboardKeyData => ({
  id,
  type: "key",
  codeMap: [character],
  width: 48,
  height: 48,
  x: 0,
  y: 0,
  rotation: 0,
  images: {
    keyDefault: "",
    keyActive: "",
    keyLocked: "",
  },
  text: {
    isVisible: true,
    normalCharacter: character,
    size: 24,
    color: "#ffffff",
  },
});

const createMouse = (id: string, image = ""): MouseData => ({
  id,
  type: "mouse",
  width: 48,
  height: 48,
  x: 0,
  y: 0,
  rotation: 0,
  buttonOverlays: {
    left: { default: "", active: "" },
    right: { default: "", active: "" },
    middle: { default: "", active: "" },
    x1: { default: "", active: "" },
    x2: { default: "", active: "" },
  },
  ring: {
    size: 48,
    color: "#ffffff",
    images: { ring: "", pointer: "" },
  },
  images: {
    mouseDefault: image,
    mouseLeftClick: "",
    mouseRightClick: "",
    mouseMiddleClick: "",
    mouseScrollUp: "",
    mouseScrollDown: "",
  },
});

const itemIds = (items: readonly LayoutItemData[]) =>
  items.map((item) => item.id);

test("shows the last rendered item as the frontmost layer", () => {
  const items = [createKey("back"), createMouse("middle"), createKey("front")];

  assert.deepEqual(itemIds(getLayerItems(items)), ["front", "middle", "back"]);
  assert.deepEqual(itemIds(items), ["back", "middle", "front"]);
});

test("moves a layer before a front-to-back target", () => {
  const items = [createKey("back"), createMouse("middle"), createKey("front")];

  const reordered = moveLayerItems(items, ["back"], "front", "before");

  assert.deepEqual(itemIds(getLayerItems(reordered)), ["back", "front", "middle"]);
});

test("moves selected layers together while preserving their relative order", () => {
  const items = [
    createKey("back"),
    createMouse("lower-middle"),
    createKey("upper-middle"),
    createMouse("front"),
  ];

  const reordered = moveLayerItems(
    items,
    ["front", "upper-middle"],
    "back",
    "after",
  );

  assert.deepEqual(itemIds(getLayerItems(reordered)), [
    "lower-middle",
    "back",
    "front",
    "upper-middle",
  ]);
});

test("does not reorder when dropping onto a moving layer", () => {
  const items = [createKey("back"), createMouse("front")];

  const reordered = moveLayerItems(items, ["front"], "front", "after");

  assert.deepEqual(itemIds(reordered), ["back", "front"]);
});

test("creates labels from key text and custom mouse imagery", () => {
  assert.equal(getLayerItemLabel(createKey("key-a", "A")), "キー A");
  assert.equal(getLayerItemLabel(createMouse("mouse")), "マウス");
  assert.equal(
    getLayerItemLabel(createMouse("mouse-image", "custom-image")),
    "マウス（画像）",
  );
});
