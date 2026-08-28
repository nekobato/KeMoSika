import assert from "node:assert/strict";
import test from "node:test";
import { parseLayoutData } from "./validation.ts";

const legacyLayout = {
  id: "legacy-layout",
  name: "Legacy layout",
  width: 800,
  height: 400,
  keys: [
    {
      id: "legacy-key",
      type: "key",
      codeMap: ["A"],
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
    },
  ],
};

const legacyMouse = {
  id: "legacy-mouse",
  type: "mouse",
  width: 120,
  height: 160,
  x: 0,
  y: 0,
  rotation: 0,
  buttonOverlays: {
    left: { default: "", active: "" },
    right: { default: "", active: "" },
    middle: { default: "", active: "" },
  },
  ring: {
    size: 160,
    color: "#ffffff",
    images: { ring: "", pointer: "" },
  },
  images: {
    mouseDefault: "",
    mouseLeftClick: "",
    mouseRightClick: "",
    mouseMiddleClick: "",
    mouseScrollUp: "",
    mouseScrollDown: "",
  },
};

test("defaults legacy key activation mode to any", () => {
  const layout = parseLayoutData(legacyLayout);
  const key = layout.keys[0];

  assert.equal(key.type, "key");
  if (key.type === "key") {
    assert.equal(key.activationMode, "any");
  }
});

test("rejects unsupported key activation modes", () => {
  assert.throws(
    () =>
      parseLayoutData({
        ...legacyLayout,
        keys: [{ ...legacyLayout.keys[0], activationMode: "mixed" }],
      }),
    /activationMode must be any or all/,
  );
});

test("accepts legacy and current keyboard text formats", () => {
  const legacyText = {
    isVisible: true,
    character: "Caps Lock",
    size: 16,
    color: "#ffffff",
  };
  const currentText = {
    isVisible: true,
    normalCharacter: "Caps Lock",
    shift: {
      isEnabled: false,
      character: "Caps Lock",
      changeOnCapsLock: false,
    },
    x: 0,
    y: 0,
    size: 16,
    color: "#ffffff",
  };

  for (const text of [legacyText, currentText]) {
    assert.doesNotThrow(() =>
      parseLayoutData({
        ...legacyLayout,
        keys: [{ ...legacyLayout.keys[0], text }],
      }),
    );
  }
});

test("adds empty X1 and X2 overlays to legacy mouse layouts", () => {
  const layout = parseLayoutData({
    ...legacyLayout,
    keys: [legacyMouse],
  });
  const mouse = layout.keys[0];

  assert.equal(mouse.type, "mouse");
  if (mouse.type === "mouse") {
    assert.deepEqual(mouse.buttonOverlays.x1, { default: "", active: "" });
    assert.deepEqual(mouse.buttonOverlays.x2, { default: "", active: "" });
  }
});

test("rejects malformed X1 overlay data", () => {
  assert.throws(
    () =>
      parseLayoutData({
        ...legacyLayout,
        keys: [
          {
            ...legacyMouse,
            buttonOverlays: {
              ...legacyMouse.buttonOverlays,
              x1: "invalid",
            },
          },
        ],
      }),
    /buttonOverlays\.x1 must be an object/,
  );
});
