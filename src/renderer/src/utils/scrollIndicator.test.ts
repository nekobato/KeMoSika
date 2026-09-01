import assert from "node:assert/strict";
import test from "node:test";
import { getScrollIndicatorGeometry } from "./scrollIndicator.ts";

test("places a restrained marker outside a 160px ring", () => {
  const geometry = getScrollIndicatorGeometry({
    direction: "up",
    ringSize: 160,
    itemRotation: 0
  });

  assert.deepEqual(geometry, {
    angle: -Math.PI / 2,
    length: 10,
    thickness: 2,
    offset: 85
  });
});

test("clamps marker dimensions for very small and large rings", () => {
  const small = getScrollIndicatorGeometry({
    direction: "right",
    ringSize: 40,
    itemRotation: 0
  });
  const large = getScrollIndicatorGeometry({
    direction: "left",
    ringSize: 400,
    itemRotation: 0
  });

  assert.deepEqual(
    { length: small.length, offset: small.offset },
    { length: 8, offset: 24 }
  );
  assert.deepEqual(
    { length: large.length, offset: large.offset },
    { length: 12, offset: 206 }
  );
});

test("compensates for the mouse item rotation", () => {
  const geometry = getScrollIndicatorGeometry({
    direction: "down",
    ringSize: 160,
    itemRotation: 90
  });

  assert.equal(geometry.angle, 0);
});
