/** Default display gain for the radial mouse-speed indicator. */
export const DEFAULT_MOUSE_SPEED_SENSITIVITY = 50;

/** Supported display-gain range for persisted mouse layouts. */
export const MOUSE_SPEED_SENSITIVITY_RANGE = {
  min: 1,
  max: 100
} as const;

/** Cursor speed that reaches the ring edge at the default sensitivity. */
export const MOUSE_FULL_SCALE_SPEED = 2000;
