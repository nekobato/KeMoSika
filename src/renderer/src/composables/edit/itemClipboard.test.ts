import assert from "node:assert/strict";
import test from "node:test";
import type {
  KeyboardKeyData,
  LayoutItemData,
  MouseData
} from "../../../../shared/types";
import { createItemClipboard } from "./itemClipboard.ts";

const createKey = (
  overrides: Partial<KeyboardKeyData> = {}
): KeyboardKeyData => ({
  id: "key-source",
  type: "key",
  codeMap: ["A"],
  activationMode: "any",
  width: 48,
  height: 48,
  x: 10,
  y: 20,
  rotation: 0,
  shadow: true,
  images: {
    keyDefault: "default-image",
    keyActive: "active-image",
    keyLocked: "locked-image"
  },
  text: {
    isVisible: true,
    normalCharacter: "A",
    shift: {
      isEnabled: true,
      character: "a",
      changeOnCapsLock: true
    },
    x: 0,
    y: 0,
    size: 24,
    color: "#ffffff"
  },
  ...overrides
});

const createMouse = (overrides: Partial<MouseData> = {}): MouseData => ({
  id: "mouse-source",
  type: "mouse",
  width: 48,
  height: 64,
  x: 42,
  y: 68,
  rotation: 10,
  shadow: true,
  buttonOverlays: {
    left: { default: "left-default", active: "left-active" },
    right: { default: "right-default", active: "right-active" },
    middle: { default: "middle-default", active: "middle-active" },
    x1: { default: "x1-default", active: "x1-active" },
    x2: { default: "x2-default", active: "x2-active" }
  },
  ring: {
    size: 80,
    color: "#ffffff",
    images: {
      ring: "ring-image",
      pointer: "pointer-image"
    }
  },
  images: {
    mouseDefault: "mouse-default",
    mouseLeftClick: "mouse-left",
    mouseRightClick: "mouse-right",
    mouseMiddleClick: "mouse-middle",
    mouseScrollUp: "mouse-up",
    mouseScrollDown: "mouse-down"
  },
  ...overrides
});

const createSequentialId = () => {
  let sequence = 0;
  return (type: LayoutItemData["type"]) => `${type}-copy-${++sequence}`;
};

test("copies an independent snapshot of all selected item data", () => {
  const key = createKey();
  const mouse = createMouse();
  const clipboard = createItemClipboard({ createId: createSequentialId() });

  clipboard.copy([key, mouse]);
  key.codeMap.push("B");
  key.images.keyDefault = "changed-after-copy";
  if (key.text?.shift) key.text.shift.character = "changed-after-copy";
  mouse.buttonOverlays.left.active = "changed-after-copy";
  mouse.ring.images.ring = "changed-after-copy";

  const pasted = clipboard.paste();

  assert.deepEqual(pasted[0], {
    ...createKey(),
    id: "key-copy-1",
    x: 26,
    y: 36
  });
  assert.deepEqual(pasted[1], {
    ...createMouse(),
    id: "mouse-copy-2",
    x: 58,
    y: 84
  });
});

test("preserves relative positions and increases the offset for repeated pastes", () => {
  const clipboard = createItemClipboard({ createId: createSequentialId() });
  clipboard.copy([createKey(), createMouse()]);

  const firstPaste = clipboard.paste();
  const secondPaste = clipboard.paste();

  assert.deepEqual(
    firstPaste.map(({ x, y }) => ({ x, y })),
    [
      { x: 26, y: 36 },
      { x: 58, y: 84 }
    ]
  );
  assert.deepEqual(
    secondPaste.map(({ x, y }) => ({ x, y })),
    [
      { x: 42, y: 52 },
      { x: 74, y: 100 }
    ]
  );
  assert.equal(
    secondPaste[1].x - secondPaste[0].x,
    createMouse().x - createKey().x
  );
  assert.equal(
    secondPaste[1].y - secondPaste[0].y,
    createMouse().y - createKey().y
  );
});

test("resets the paste offset when a new selection is copied", () => {
  const clipboard = createItemClipboard({ createId: createSequentialId() });
  clipboard.copy([createKey()]);
  clipboard.paste();
  clipboard.paste();

  clipboard.copy([createMouse({ x: 100, y: 120 })]);

  assert.deepEqual(
    clipboard.paste().map(({ x, y }) => ({ x, y })),
    [{ x: 116, y: 136 }]
  );
});

test("returns no items before anything has been copied", () => {
  const clipboard = createItemClipboard({ createId: createSequentialId() });

  assert.deepEqual(clipboard.paste(), []);
});
