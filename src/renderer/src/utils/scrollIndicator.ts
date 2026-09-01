import type { ScrollDirection } from "@shared/types";

export const SCROLL_INDICATOR_DIRECTIONS = [
  "up",
  "right",
  "down",
  "left"
] as const satisfies readonly ScrollDirection[];

type ScrollIndicatorGeometryInput = {
  direction: ScrollDirection;
  ringSize: number;
  itemRotation: number;
};

export type ScrollIndicatorGeometry = {
  angle: number;
  length: number;
  thickness: number;
  offset: number;
};

const directionAngles: Record<ScrollDirection, number> = {
  up: -Math.PI / 2,
  right: 0,
  down: Math.PI / 2,
  left: Math.PI
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

/** Resolves image-independent marker geometry around the pointer ring. */
export const getScrollIndicatorGeometry = ({
  direction,
  ringSize,
  itemRotation
}: ScrollIndicatorGeometryInput): ScrollIndicatorGeometry => {
  const normalizedRingSize = Math.max(0, ringSize);
  const gap = Math.round(clamp(normalizedRingSize * 0.03, 4, 6));
  const itemRotationRadians = (itemRotation * Math.PI) / 180;

  return {
    angle: directionAngles[direction] - itemRotationRadians,
    length: clamp(normalizedRingSize * 0.0625, 8, 12),
    thickness: 2,
    offset: normalizedRingSize / 2 + gap
  };
};
