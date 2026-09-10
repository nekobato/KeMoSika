import assert from "node:assert/strict";
import test from "node:test";
import { parseErrorReportingEnabled } from "./validation.ts";

test("reporting consent accepts only explicit booleans", () => {
  assert.equal(parseErrorReportingEnabled(false), false);
  assert.equal(parseErrorReportingEnabled(true), true);
  for (const value of [undefined, null, 0, 1, "true", "false", {}, []]) {
    assert.throws(
      () => parseErrorReportingEnabled(value),
      /設定が正しくありません/,
    );
  }
});
