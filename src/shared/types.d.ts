/** Controls how a keyboard item matches its configured key codes. */
export type KeyActivationMode = "any" | "all";

export type MouseButtonName = "left" | "right" | "middle" | "x1" | "x2";
export type MouseButtonCode = 1 | 2 | 3 | 4 | 5;

export type KeyboardKeyTextData = {
  isVisible: boolean;
  /** Current normal-state text. Older layouts may only have `character`. */
  normalCharacter?: string;
  /** Legacy normal-state text retained for persisted-layout compatibility. */
  character?: string;
  shift?: {
    isEnabled: boolean;
    character: string;
    changeOnCapsLock: boolean;
  };
  x?: number;
  y?: number;
  size: number;
  color: string;
  font?: string;
};

export type KeyboardKeyData = {
  id: string;
  type: "key";
  codeMap: string[];
  /** Defaults to `any` when loading layouts created by older versions. */
  activationMode?: KeyActivationMode;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  shadow?: boolean;
  images: {
    keyDefault: string;
    keyActive: string;
    keyLocked: string;
  };
  text?: KeyboardKeyTextData;
};

export type MouseData = {
  id: string;
  type: "mouse";
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  shadow?: boolean;
  buttonOverlays: Record<
    MouseButtonName,
    { default: string; active: string }
  >;
  ring: {
    size: number;
    color: string;
    images: {
      ring: string;
      pointer: string;
    };
  };
  images: {
    mouseDefault: string;
    mouseLeftClick: string;
    mouseRightClick: string;
    mouseMiddleClick: string;
    mouseScrollUp: string;
    mouseScrollDown: string;
  };
};

export type imageType =
  | "keyDefault"
  | "keyActive"
  | "mouseDefault"
  | "mouseLeftClick"
  | "mouseRightClick"
  | "mouseMiddleClick"
  | "mouseScrollUp"
  | "mouseScrollDown"
  | "ring"
  | "pointer"
  | "leftDefault"
  | "leftActive"
  | "rightDefault"
  | "rightActive"
  | "middleDefault"
  | "middleActive"
  | "x1Default"
  | "x1Active"
  | "x2Default"
  | "x2Active";

export type LayoutItemData = KeyboardKeyData | MouseData;
export type LayoutData = {
  id: string;
  name: string;
  width: number;
  height: number;
  background: {
    color: string;
    image: string;
  };
  keys: LayoutItemData[];
};

export type LayoutItemImage = {
  id: string;
  fileName: string;
};

export type CanvasSettings = {
  width: number;
  height: number;
};

export type MouseState = {
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
  buttons: MouseButtonCode[];
  type: number;
  amount: number;
};
