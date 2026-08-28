import { EventType, type UiohookMouseEvent } from "uiohook-napi";
import { isMouseButtonCode } from "./mouse-buttons.ts";
import type { MouseButtonCode } from "@shared/types";

export type MouseButtonNormalizationResult = {
  event: UiohookMouseEvent;
  repairedRelease: boolean;
};

type MouseButtonNormalizerOptions = {
  /** Repairs libuiohook's Darwin OtherMouseUp-as-pressed behavior. */
  repairRepeatedOtherButtonPresses: boolean;
};

/**
 * Normalizes mouse button transitions while keeping native-library quirks out
 * of the renderer. The compatibility repair can be removed after the bundled
 * libuiohook emits OtherMouseUp as EVENT_MOUSE_RELEASED on macOS.
 */
export const createMouseButtonNormalizer = ({
  repairRepeatedOtherButtonPresses
}: MouseButtonNormalizerOptions) => {
  const pressedButtons = new Set<MouseButtonCode>();

  const normalize = (
    event: UiohookMouseEvent
  ): MouseButtonNormalizationResult => {
    if (!isMouseButtonCode(event.button)) {
      return { event, repairedRelease: false };
    }

    const button = event.button;
    if (event.type === EventType.EVENT_MOUSE_RELEASED) {
      pressedButtons.delete(button);
      return { event, repairedRelease: false };
    }

    const isRepeatedOtherButtonPress =
      repairRepeatedOtherButtonPresses &&
      button >= 3 &&
      pressedButtons.has(button);

    if (isRepeatedOtherButtonPress) {
      pressedButtons.delete(button);
      return {
        event: {
          ...event,
          type: EventType.EVENT_MOUSE_RELEASED
        },
        repairedRelease: true
      };
    }

    pressedButtons.add(button);
    return { event, repairedRelease: false };
  };

  const reset = (): void => {
    pressedButtons.clear();
  };

  const snapshot = (): MouseButtonCode[] => [...pressedButtons];

  return { normalize, reset, snapshot };
};
