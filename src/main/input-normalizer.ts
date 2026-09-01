import {
  EventType,
  WheelDirection,
  type UiohookKeyboardEvent,
  type UiohookMouseEvent,
  type UiohookWheelEvent
} from "uiohook-napi";
import type { VisualizerInputEvent } from "@shared/input";
import type { ScrollDirection } from "@shared/types";
import { isMouseButtonCode } from "./mouse-buttons.ts";

type UiohookInputEvent =
  | UiohookKeyboardEvent
  | UiohookMouseEvent
  | UiohookWheelEvent;

const getScrollDirection = (
  event: UiohookWheelEvent
): ScrollDirection | null => {
  if (event.rotation === 0) return null;

  if (event.direction === WheelDirection.VERTICAL) {
    return event.rotation < 0 ? "up" : "down";
  }

  if (event.direction === WheelDirection.HORIZONTAL) {
    return event.rotation < 0 ? "left" : "right";
  }

  return null;
};

/**
 * Converts native hook events into the minimal renderer input contract.
 * Native-only metadata such as wheel amount and modifier flags is omitted.
 */
export const normalizeVisualizerInput = (
  event: UiohookInputEvent
): VisualizerInputEvent | null => {
  switch (event.type) {
    case EventType.EVENT_KEY_PRESSED:
      return { kind: "key", action: "pressed", keycode: event.keycode };
    case EventType.EVENT_KEY_RELEASED:
      return { kind: "key", action: "released", keycode: event.keycode };
    case EventType.EVENT_MOUSE_PRESSED:
    case EventType.EVENT_MOUSE_RELEASED:
      if (!isMouseButtonCode(event.button)) return null;
      return {
        kind: "mouse-button",
        action:
          event.type === EventType.EVENT_MOUSE_PRESSED
            ? "pressed"
            : "released",
        button: event.button
      };
    case EventType.EVENT_MOUSE_MOVED:
      return { kind: "mouse-move", x: event.x, y: event.y };
    case EventType.EVENT_MOUSE_WHEEL: {
      const direction = getScrollDirection(event);
      return direction === null ? null : { kind: "scroll", direction };
    }
    case EventType.EVENT_MOUSE_CLICKED:
      return null;
  }
};
