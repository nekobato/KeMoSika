/**
 * Resolves the fixed body and transparent button layers for the mouse visual.
 */
import type { MouseData } from "@shared/types";

export type MouseButtonOverlays = MouseData["buttonOverlays"];
export type MouseButtonName = keyof MouseButtonOverlays;
export type MouseButtonImageIds = Record<MouseButtonName, string>;

/** Generated bundled mouse body used when a layout has no custom body. */
export const DEFAULT_MOUSE_BASE_IMAGE_ID = "default_mouse_generated_v1";

/** Generated transparent overlays paired with the bundled mouse body. */
export const DEFAULT_MOUSE_BUTTON_IMAGE_IDS: MouseButtonImageIds = {
  left: "default_mouse_generated_left_active_v1",
  right: "default_mouse_generated_right_active_v1",
  middle: "default_mouse_generated_middle_active_v1"
};

export type MouseButtonLayer = {
  button: MouseButtonName;
  imageId: string;
};

export type MouseVisualLayers = {
  baseImageId: string;
  buttonLayers: MouseButtonLayer[];
};

type ResolveMouseVisualLayersOptions = {
  baseImageId: string;
  fallbackBaseImageId: string;
  fallbackButtonImageIds: MouseButtonImageIds;
  buttonOverlays: MouseButtonOverlays;
  pressedButtons: number[];
};

const BUTTON_DEFINITIONS: ReadonlyArray<{
  button: MouseButtonName;
  code: number;
}> = [
  { button: "left", code: 1 },
  { button: "right", code: 2 },
  { button: "middle", code: 3 }
];

/**
 * Selects one transparent image per mouse button while keeping the body fixed.
 */
export const resolveMouseVisualLayers = ({
  baseImageId,
  fallbackBaseImageId,
  fallbackButtonImageIds,
  buttonOverlays,
  pressedButtons
}: ResolveMouseVisualLayersOptions): MouseVisualLayers => {
  const buttonLayers = BUTTON_DEFINITIONS.flatMap(({ button, code }) => {
    const usesBundledBase = !baseImageId || baseImageId === fallbackBaseImageId;
    const fallbackImageId = usesBundledBase
      ? fallbackButtonImageIds[button]
      : "";
    const imageId = pressedButtons.includes(code)
      ? buttonOverlays[button].active || fallbackImageId
      : "";

    return imageId ? [{ button, imageId }] : [];
  });

  return {
    baseImageId: baseImageId || fallbackBaseImageId,
    buttonLayers
  };
};
