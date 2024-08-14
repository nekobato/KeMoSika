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
    mouseDefault: string;
    mouseLeftClick: string;
    mouseRightClick: string;
    mouseMiddleClick: string;
    mouseScrollUp: string;
    mouseScrollDown: string;
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
    keyDefault: string;
    keyActive: string;
    mouseDefault: string;
    mouseLeftClick: string;
    mouseRightClick: string;
    mouseMiddleClick: string;
    mouseScrollUp: string;
    mouseScrollDown: string;
  };
};

export type LayoutItemData = KeyboardKeyData | MouseData;
export type LayoutData = {
  id: string;
  name: string;
  keys: LayoutItemData[];
};
