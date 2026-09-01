import assert from "node:assert/strict";
import test from "node:test";
import {
  EventType,
  WheelDirection,
  type UiohookKeyboardEvent,
  type UiohookMouseEvent,
  type UiohookWheelEvent
} from "uiohook-napi";
import { normalizeVisualizerInput } from "./input-normalizer.ts";

const commonEvent = {
  time: 1,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false
};

const keyboardEvent = (
  type:
    | EventType.EVENT_KEY_PRESSED
    | EventType.EVENT_KEY_RELEASED,
  keycode = 30
): UiohookKeyboardEvent => ({
  ...commonEvent,
  type,
  keycode
});

const mouseEvent = (
  type:
    | EventType.EVENT_MOUSE_CLICKED
    | EventType.EVENT_MOUSE_PRESSED
    | EventType.EVENT_MOUSE_RELEASED
    | EventType.EVENT_MOUSE_MOVED,
  button: unknown = 1
): UiohookMouseEvent => ({
  ...commonEvent,
  type,
  x: 120,
  y: 240,
  button,
  clicks: 1
});

const wheelEvent = (
  direction: WheelDirection,
  rotation: number
): UiohookWheelEvent => ({
  ...commonEvent,
  type: EventType.EVENT_MOUSE_WHEEL,
  x: 120,
  y: 240,
  clicks: 1,
  amount: 12,
  direction,
  rotation
});

test("normalizes keyboard press and release actions", () => {
  assert.deepEqual(
    normalizeVisualizerInput(
      keyboardEvent(EventType.EVENT_KEY_PRESSED)
    ),
    { kind: "key", action: "pressed", keycode: 30 }
  );
  assert.deepEqual(
    normalizeVisualizerInput(
      keyboardEvent(EventType.EVENT_KEY_RELEASED)
    ),
    { kind: "key", action: "released", keycode: 30 }
  );
});

test("normalizes supported mouse button transitions", () => {
  assert.deepEqual(
    normalizeVisualizerInput(
      mouseEvent(EventType.EVENT_MOUSE_PRESSED, 4)
    ),
    { kind: "mouse-button", action: "pressed", button: 4 }
  );
  assert.deepEqual(
    normalizeVisualizerInput(
      mouseEvent(EventType.EVENT_MOUSE_RELEASED, 4)
    ),
    { kind: "mouse-button", action: "released", button: 4 }
  );
});

test("drops unsupported mouse buttons and click-only events", () => {
  assert.equal(
    normalizeVisualizerInput(
      mouseEvent(EventType.EVENT_MOUSE_PRESSED, 99)
    ),
    null
  );
  assert.equal(
    normalizeVisualizerInput(mouseEvent(EventType.EVENT_MOUSE_CLICKED)),
    null
  );
});

test("normalizes mouse movement without native event metadata", () => {
  assert.deepEqual(
    normalizeVisualizerInput(mouseEvent(EventType.EVENT_MOUSE_MOVED)),
    { kind: "mouse-move", x: 120, y: 240 }
  );
});

test("maps vertical wheel rotation to up and down", () => {
  assert.deepEqual(
    normalizeVisualizerInput(wheelEvent(WheelDirection.VERTICAL, -1)),
    { kind: "scroll", direction: "up" }
  );
  assert.deepEqual(
    normalizeVisualizerInput(wheelEvent(WheelDirection.VERTICAL, 1)),
    { kind: "scroll", direction: "down" }
  );
});

test("maps horizontal wheel rotation to left and right", () => {
  assert.deepEqual(
    normalizeVisualizerInput(wheelEvent(WheelDirection.HORIZONTAL, -1)),
    { kind: "scroll", direction: "left" }
  );
  assert.deepEqual(
    normalizeVisualizerInput(wheelEvent(WheelDirection.HORIZONTAL, 1)),
    { kind: "scroll", direction: "right" }
  );
});

test("drops zero-rotation wheel input", () => {
  assert.equal(
    normalizeVisualizerInput(wheelEvent(WheelDirection.VERTICAL, 0)),
    null
  );
});
