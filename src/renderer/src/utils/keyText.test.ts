import assert from "node:assert/strict";
import test from "node:test";
import type { KeyboardKeyTextData } from "@shared/types";
import {
  getDefaultShiftCharacter,
  resolveKeyboardKeyCharacter
} from "./keyText.ts";

const createText = (
  shift: NonNullable<KeyboardKeyTextData["shift"]>
): KeyboardKeyTextData => ({
  isVisible: true,
  normalCharacter: "a",
  shift,
  x: 0,
  y: 0,
  size: 24,
  color: "#71d4fe"
});

test("renders legacy character-only text data", () => {
  assert.equal(
    resolveKeyboardKeyCharacter(
      {
        isVisible: true,
        character: "Caps Lock",
        size: 16,
        color: "#71d4fe"
      },
      { shiftPressed: false, capsLockActive: true }
    ),
    "Caps Lock"
  );
});

test("defaults one lowercase ASCII letter to its uppercase form", () => {
  assert.equal(getDefaultShiftCharacter("a"), "A");
  assert.equal(getDefaultShiftCharacter("z"), "Z");
});

test("preserves characters that are not one lowercase ASCII letter", () => {
  assert.equal(getDefaultShiftCharacter("A"), "A");
  assert.equal(getDefaultShiftCharacter("1"), "1");
  assert.equal(getDefaultShiftCharacter("abc"), "abc");
  assert.equal(getDefaultShiftCharacter("あ"), "あ");
});

test("ignores both modifiers when Shift switching is disabled", () => {
  const text = createText({
    isEnabled: false,
    character: "A",
    changeOnCapsLock: true
  });

  assert.equal(
    resolveKeyboardKeyCharacter(text, {
      shiftPressed: true,
      capsLockActive: true
    }),
    "a"
  );
});

test("uses only physical Shift when Caps Lock switching is disabled", () => {
  const text = createText({
    isEnabled: true,
    character: "A",
    changeOnCapsLock: false
  });

  assert.equal(
    resolveKeyboardKeyCharacter(text, {
      shiftPressed: false,
      capsLockActive: true
    }),
    "a"
  );
  assert.equal(
    resolveKeyboardKeyCharacter(text, {
      shiftPressed: true,
      capsLockActive: true
    }),
    "A"
  );
});

test("uses Shift XOR Caps Lock when Caps Lock switching is enabled", () => {
  const text = createText({
    isEnabled: true,
    character: "A",
    changeOnCapsLock: true
  });

  const cases = [
    { shiftPressed: false, capsLockActive: false, expected: "a" },
    { shiftPressed: true, capsLockActive: false, expected: "A" },
    { shiftPressed: false, capsLockActive: true, expected: "A" },
    { shiftPressed: true, capsLockActive: true, expected: "a" }
  ];

  cases.forEach(({ expected, ...modifiers }) => {
    assert.equal(resolveKeyboardKeyCharacter(text, modifiers), expected);
  });
});
