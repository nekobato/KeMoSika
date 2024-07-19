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
    default: string;
    keyPress: string;
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
  images: {
    default: string;
    leftClick: string;
    rightClick: string;
    middleClick: string;
    scrollUp: string;
    scrollDown: string;
  };
};

export type LayoutItemData = KeyboardKeyData | MouseData;
