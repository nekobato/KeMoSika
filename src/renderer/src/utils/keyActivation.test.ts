import assert from "node:assert/strict";
import test from "node:test";
import {
  getActiveKeyboardCodes,
  isKeyboardKeyActive
} from "./keyActivation.ts";

test("combines physically held keys with enabled Lock keys", () => {
  assert.deepEqual(
    getActiveKeyboardCodes(["a", "capslock"], {
      capsLock: true,
      numLock: true,
      scrollLock: false
    }),
    ["a", "capslock", "numlock"]
  );
});

test("any mode activates when at least one configured key is down", () => {
  assert.equal(isKeyboardKeyActive(["Control", "A"], ["A"], "any"), true);
  assert.equal(isKeyboardKeyActive(["Control", "A"], ["B"], "any"), false);
});

test("all mode activates only when every configured key is down", () => {
  assert.equal(isKeyboardKeyActive(["Control", "A"], ["A"], "all"), false);
  assert.equal(
    isKeyboardKeyActive(["Control", "A"], ["Control", "A"], "all"),
    true
  );
});

test("an empty key map never activates", () => {
  assert.equal(isKeyboardKeyActive([], ["A"], "any"), false);
  assert.equal(isKeyboardKeyActive([], ["A"], "all"), false);
});

test("missing mode preserves the existing any-key behavior", () => {
  assert.equal(isKeyboardKeyActive(["Control", "A"], ["A"]), true);
});
