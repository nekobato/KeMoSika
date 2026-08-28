import assert from "node:assert/strict";
import test from "node:test";
import { keyboardCodeToInputCode, keyCodeMap } from "./keyCodes.ts";

test("normalizes DOM keyboard codes to visualizer input codes", () => {
  assert.deepEqual(
    [
      "KeyA",
      "Digit1",
      "ControlLeft",
      "ControlRight",
      "MetaLeft",
      "ArrowUp",
      "NumpadAdd",
      "NumpadEnter",
      "F19",
    ].map(keyboardCodeToInputCode),
    ["A", "1", "control", "control", "meta", "up", "numpad+", "numpadenter", "f19"],
  );
});

test("returns an empty code for unsupported DOM keys", () => {
  assert.equal(keyboardCodeToInputCode("AudioVolumeUp"), "");
});

test("maps Caps, Num, and Scroll Lock consistently", () => {
  assert.deepEqual(
    ["CapsLock", "NumLock", "ScrollLock"].map(keyboardCodeToInputCode),
    ["capslock", "numlock", "scrolllock"],
  );
  assert.deepEqual(
    [keyCodeMap[58], keyCodeMap[69], keyCodeMap[70]],
    ["capslock", "numlock", "scrolllock"],
  );
});

test("maps extended uiohook codes without colliding with function keys", () => {
  assert.equal(keyCodeMap[3613], "control");
  assert.equal(keyCodeMap[3675], "meta");
  assert.equal(keyCodeMap[57416], "up");
  assert.equal(keyCodeMap[102], "f19");
});
