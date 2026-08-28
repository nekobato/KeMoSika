/**
 * Resolves the fixed body and transparent button layers for the mouse visual.
 */
import type {
  MouseButtonCode,
  MouseButtonName as SharedMouseButtonName,
  MouseData
} from "@shared/types";
import { mouseButtonDefinitions } from "../utils/mouseButtons.ts";

export type MouseButtonOverlays = MouseData["buttonOverlays"];
export type MouseButtonName = SharedMouseButtonName;
export type MouseButtonImageIds = Record<MouseButtonName, string>;

/** Generated bundled mouse body used when a layout has no custom body. */
export const DEFAULT_MOUSE_BASE_IMAGE_ID = "default_mouse_generated_v1";

/** Generated transparent overlays paired with the bundled mouse body. */
export const DEFAULT_MOUSE_BUTTON_IMAGE_IDS: MouseButtonImageIds = {
  left: "default_mouse_generated_left_active_v1",
  right: "default_mouse_generated_right_active_v1",
  middle: "default_mouse_generated_middle_active_v1",
  x1: "default_mouse_generated_x1_active_v1",
  x2: "default_mouse_generated_x2_active_v1"
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
  pressedButtons: readonly MouseButtonCode[];
};

const BUTTON_DEFINITIONS = mouseButtonDefinitions.map(({ name, code }) => ({
  button: name,
  code
}));

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
      ? buttonOverlays[button]?.active || fallbackImageId
      : "";

    return imageId ? [{ button, imageId }] : [];
  });

  return {
    baseImageId: baseImageId || fallbackBaseImageId,
    buttonLayers
  };
};
