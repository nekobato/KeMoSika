import type {
  MouseButtonCode,
  ScrollDirection
} from "./types";

export type VisualizerInputEvent =
  | {
      kind: "key";
      action: "pressed" | "released";
      keycode: number;
    }
  | {
      kind: "mouse-button";
      action: "pressed" | "released";
      button: MouseButtonCode;
    }
  | {
      kind: "mouse-move";
      x: number;
      y: number;
    }
  | {
      kind: "scroll";
      direction: ScrollDirection;
    };
