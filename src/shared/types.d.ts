export type KeyboardKeyData = {
  id: string;
  type: "key";
  codeMap: string[];
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  images: {
    keyDefault: string;
    keyActive: string;
    keyLocked: string;
  };
  text?: {
    isVisible: boolean;
    character: string;
    x?: number;
    y?: number;
    size: number;
    color: string;
    font?: string;
  };
};

export type MouseData = {
  id: string;
  type: "mouse";
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
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
  | "mouseScrollDown";

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
  buttons: number[];
  type: number;
  amount: number;
};
