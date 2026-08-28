import type { MouseButtonCode, MouseButtonName } from "@shared/types";

/** Canonical mouse buttons understood by the visualizer. */
export const mouseButtonDefinitions = [
  { name: "left", code: 1 },
  { name: "right", code: 2 },
  { name: "middle", code: 3 },
  { name: "x1", code: 4 },
  { name: "x2", code: 5 }
] as const satisfies ReadonlyArray<{
  name: MouseButtonName;
  code: MouseButtonCode;
}>;

/** Narrows a native input value to a supported visualizer mouse button. */
export const isMouseButtonCode = (value: unknown): value is MouseButtonCode =>
  mouseButtonDefinitions.some(({ code }) => code === value);
