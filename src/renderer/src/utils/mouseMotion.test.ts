import assert from "node:assert/strict";
import test from "node:test";
import {
  MOUSE_TRAIL_LAYERS,
  createMouseMotionState,
  interpolateAngle,
  registerMousePosition,
  speedToProgress,
  stepMouseMotion,
  type MouseMotionState
} from "./mouseMotion.ts";

const registerMovement = (
  state: MouseMotionState,
  x: number,
  timestamp: number
) => registerMousePosition(state, { x, y: 0, timestamp });

test("maps speed and sensitivity to a bounded radial progress", () => {
  assert.equal(speedToProgress(0, 50), 0);
  assert.equal(speedToProgress(1000, 50), 0.5);
  assert.equal(speedToProgress(2000, 50), 1);
  assert.equal(speedToProgress(1000, 100), 1);
  assert.equal(speedToProgress(5000, 100), 1);
});

test("initializes the first position without producing a false velocity", () => {
  const first = registerMovement(createMouseMotionState(), 120, 1000);

  assert.equal(first.hasMotion, false);
  assert.equal(first.state.lastInputAt, null);
});

test("derives a velocity from subsequent timestamped positions", () => {
  const first = registerMovement(createMouseMotionState(), 0, 0);
  const second = registerMovement(first.state, 20, 10);
  const frame = stepMouseMotion(second.state, {
    timestamp: 26,
    delta: 16,
    reducedMotion: false
  });

  assert.equal(second.hasMotion, true);
  assert.ok(frame.visualState.current.speed > 0);
  assert.equal(frame.visualState.current.angle, 0);
});

test("rebases the first position after a long idle gap", () => {
  const first = registerMovement(createMouseMotionState(), 0, 0);
  const moving = registerMovement(first.state, 20, 10);
  const rebased = registerMovement(moving.state, 600, 1000);
  const resumed = registerMovement(rebased.state, 620, 1010);

  assert.equal(rebased.hasMotion, false);
  assert.equal(resumed.hasMotion, true);
});

test("interpolates across the angle boundary by the shortest route", () => {
  const degrees = (value: number) => (value * Math.PI) / 180;
  const result = interpolateAngle(degrees(359), degrees(1), 0.5);

  assert.ok(Math.abs(result) < degrees(0.01));
});

test("returns monotonically to rest and eventually settles", () => {
  let state = createMouseMotionState();
  let visualSpeed = 0;

  for (let index = 0; index <= 10; index += 1) {
    const timestamp = index * 10;
    const registration = registerMovement(state, index * 20, timestamp);
    state = registration.state;
    const frame = stepMouseMotion(state, {
      timestamp,
      delta: 10,
      reducedMotion: false
    });
    state = frame.state;
    visualSpeed = frame.visualState.current.speed;
  }

  assert.ok(visualSpeed > 0);

  let previousSpeed = visualSpeed;
  let settled = false;
  for (let timestamp = 151; timestamp <= 900; timestamp += 16) {
    const frame = stepMouseMotion(state, {
      timestamp,
      delta: 16,
      reducedMotion: false
    });
    state = frame.state;
    assert.ok(frame.visualState.current.speed <= previousSpeed);
    previousSpeed = frame.visualState.current.speed;
    settled = frame.isSettled;
    if (settled) break;
  }

  assert.equal(settled, true);
  assert.equal(previousSpeed, 0);
});

test("uses two very light trail layers without additive brightness", () => {
  assert.deepEqual(MOUSE_TRAIL_LAYERS, [
    { delay: 24, opacity: 0.08 },
    { delay: 48, opacity: 0.04 }
  ]);
  assert.equal(
    MOUSE_TRAIL_LAYERS.reduce((sum, layer) => sum + layer.opacity, 0),
    0.12
  );
});

test("removes temporal trails when reduced motion is preferred", () => {
  const first = registerMovement(createMouseMotionState(), 0, 0);
  const second = registerMovement(first.state, 20, 10);
  const frame = stepMouseMotion(second.state, {
    timestamp: 16,
    delta: 16,
    reducedMotion: true
  });

  assert.equal(frame.visualState.current.speed, 2000);
  assert.deepEqual(frame.visualState.trail, []);
});
