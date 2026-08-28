import assert from "node:assert/strict";
import test from "node:test";
import {
  createKeyboardLockStateTracker,
  parseWindowsKeyboardLockState
} from "./keyboard-lock-state.ts";

test("parses the Windows lock-state probe result", () => {
  assert.deepEqual(
    parseWindowsKeyboardLockState(
      '{"capsLock":true,"numLock":false,"scrollLock":true}'
    ),
    { capsLock: true, numLock: false, scrollLock: true }
  );
});

test("rejects an invalid Windows lock-state probe result", () => {
  assert.throws(() => parseWindowsKeyboardLockState("{}"));
});

test("tracks lock toggles and ignores repeated key-down events", () => {
  const tracker = createKeyboardLockStateTracker({ 58: "capsLock" });

  tracker.reset({ capsLock: false, numLock: true, scrollLock: false });
  const pressed = tracker.press(58);
  const repeated = tracker.press(58);
  tracker.release(58);
  const pressedAgain = tracker.press(58);

  assert.deepEqual(
    {
      first: pressed?.capsLock,
      repeated,
      second: pressedAgain?.capsLock,
      numLock: pressedAgain?.numLock
    },
    { first: true, repeated: null, second: false, numLock: true }
  );
});
