import type { KeyboardKeyData, LayoutData } from "@shared/types";

const defaultKeyWidth = 52;
const defaultKeyHeight = 52;
const keyGap = 8;
const textColor = "#71d4fe";

export type KeySpec = {
  id: string;
  label: string;
  codeMap: string[];
  width?: number;
  height?: number;
  textSize?: number;
};

export type PositionedKeySpec = KeySpec & {
  x: number;
  y: number;
};

/**
 * Creates a compact key spec for generated built-in keyboard layouts.
 */
export const key = (
  id: string,
  label: string,
  codeMap: string[],
  width = defaultKeyWidth,
  textSize?: number
): KeySpec => ({
  id,
  label,
  codeMap,
  width,
  textSize
});

/**
 * Creates a key item with default images and visible label text.
 */
export const createKeyboardKey = (
  prefix: string,
  spec: PositionedKeySpec
): KeyboardKeyData => ({
  id: `${prefix}-${spec.id}`,
  type: "key",
  codeMap: spec.codeMap,
  width: spec.width ?? defaultKeyWidth,
  height: spec.height ?? defaultKeyHeight,
  x: spec.x,
  y: spec.y,
  rotation: 0,
  images: {
    keyDefault: "key_default",
    keyActive: "key_active",
    keyLocked: ""
  },
  text: {
    isVisible: true,
    character: spec.label,
    x: 0,
    y: 0,
    size:
      spec.textSize ??
      (spec.label.length > 4 ? 12 : spec.label.length > 2 ? 14 : 16),
    color: textColor
  }
});

/**
 * Creates a horizontal row of keys from left to right.
 */
export const createRow = (
  prefix: string,
  y: number,
  startX: number,
  specs: KeySpec[],
  rowHeight = defaultKeyHeight
): KeyboardKeyData[] => {
  return specs.reduce<{ keys: KeyboardKeyData[]; x: number }>(
    (state, spec) => {
      const item = createKeyboardKey(prefix, {
        ...spec,
        height: spec.height ?? rowHeight,
        x: state.x,
        y
      });

      return {
        keys: [...state.keys, item],
        x: state.x + (spec.width ?? defaultKeyWidth) + keyGap
      };
    },
    { keys: [], x: startX }
  ).keys;
};

/**
 * Creates a complete layout with the shared built-in layout background.
 */
export const createLayout = (input: {
  id: string;
  name: string;
  width: number;
  height: number;
  keys: Array<KeyboardKeyData | KeyboardKeyData[]>;
}): LayoutData => ({
  id: input.id,
  name: input.name,
  width: input.width,
  height: input.height,
  background: {
    color: "#252525",
    image: ""
  },
  keys: input.keys.flat()
});
