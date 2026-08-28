import assert from "node:assert/strict";
import test from "node:test";
import {
  EventType,
  type UiohookMouseEvent
} from "uiohook-napi";
import { createMouseButtonNormalizer } from "./mouse-button-normalizer.ts";

const mouseEvent = (
  type:
    | EventType.EVENT_MOUSE_PRESSED
    | EventType.EVENT_MOUSE_RELEASED,
  button: number
): UiohookMouseEvent => ({
  type,
  time: 1,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  x: 0,
  y: 0,
  button,
  clicks: 1
});

test("preserves a normal X1 press and release sequence", () => {
  const normalizer = createMouseButtonNormalizer({
    repairRepeatedOtherButtonPresses: true
  });

  const pressed = normalizer.normalize(
    mouseEvent(EventType.EVENT_MOUSE_PRESSED, 4)
  );
  const released = normalizer.normalize(
    mouseEvent(EventType.EVENT_MOUSE_RELEASED, 4)
  );

  assert.equal(pressed.event.type, EventType.EVENT_MOUSE_PRESSED);
  assert.equal(released.event.type, EventType.EVENT_MOUSE_RELEASED);
  assert.deepEqual(normalizer.snapshot(), []);
});

test("repairs Darwin OtherMouseUp emitted as a repeated press", () => {
  const normalizer = createMouseButtonNormalizer({
    repairRepeatedOtherButtonPresses: true
  });

  normalizer.normalize(mouseEvent(EventType.EVENT_MOUSE_PRESSED, 5));
  const repaired = normalizer.normalize(
    mouseEvent(EventType.EVENT_MOUSE_PRESSED, 5)
  );

  assert.equal(repaired.event.type, EventType.EVENT_MOUSE_RELEASED);
  assert.equal(repaired.repairedRelease, true);
  assert.deepEqual(normalizer.snapshot(), []);
});

test("repairs the same Darwin behavior for the middle button", () => {
  const normalizer = createMouseButtonNormalizer({
    repairRepeatedOtherButtonPresses: true
  });

  normalizer.normalize(mouseEvent(EventType.EVENT_MOUSE_PRESSED, 3));
  const repaired = normalizer.normalize(
    mouseEvent(EventType.EVENT_MOUSE_PRESSED, 3)
  );

  assert.equal(repaired.event.type, EventType.EVENT_MOUSE_RELEASED);
});

test("does not reinterpret repeated presses when repair is disabled", () => {
  const normalizer = createMouseButtonNormalizer({
    repairRepeatedOtherButtonPresses: false
  });

  normalizer.normalize(mouseEvent(EventType.EVENT_MOUSE_PRESSED, 4));
  const repeated = normalizer.normalize(
    mouseEvent(EventType.EVENT_MOUSE_PRESSED, 4)
  );

  assert.equal(repeated.event.type, EventType.EVENT_MOUSE_PRESSED);
  assert.equal(repeated.repairedRelease, false);
});

test("reset clears buttons held when the hook stops", () => {
  const normalizer = createMouseButtonNormalizer({
    repairRepeatedOtherButtonPresses: true
  });

  normalizer.normalize(mouseEvent(EventType.EVENT_MOUSE_PRESSED, 4));
  normalizer.reset();
  const nextPress = normalizer.normalize(
    mouseEvent(EventType.EVENT_MOUSE_PRESSED, 4)
  );

  assert.equal(nextPress.event.type, EventType.EVENT_MOUSE_PRESSED);
  assert.deepEqual(normalizer.snapshot(), [4]);
});
