import type { LayoutData } from "@shared/types";

export const DEFAULT_LAYOUT_BACKGROUND_COLOR = "#252525";
const imageIdPattern = /^[a-zA-Z0-9_-]+$/;

export type LayoutBackgroundStyle = {
  "--layout-background-color": string;
  "--layout-background-image": string;
};

/**
 * Converts persisted layout background settings into safe CSS custom properties.
 */
export const createLayoutBackgroundStyle = (
  background?: LayoutData["background"],
): LayoutBackgroundStyle => ({
  "--layout-background-color":
    background?.color || DEFAULT_LAYOUT_BACKGROUND_COLOR,
  "--layout-background-image":
    background?.image && imageIdPattern.test(background.image)
      ? `url("media://images/${background.image}.png")`
      : "none",
});
