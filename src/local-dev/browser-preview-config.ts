import type { ConfigData } from "../shared/app-api";
import type { LayoutData } from "../shared/types";

/**
 * Creates a stable sample layout for local browser development.
 */
export const createBrowserPreviewLayout = (): LayoutData => {
  return {
    id: "browser-use-layout",
    name: "Browser Use レイアウト",
    width: 800,
    height: 400,
    background: {
      color: "#252525",
      image: ""
    },
    keys: [
      {
        id: "browser-use-key-a",
        type: "key",
        codeMap: ["A"],
        x: 96,
        y: 96,
        width: 64,
        height: 64,
        rotation: 0,
        images: {
          keyDefault: "",
          keyActive: "",
          keyLocked: ""
        },
        text: {
          isVisible: true,
          character: "A",
          x: 0,
          y: 0,
          size: 24,
          color: "#71d4fe"
        }
      },
      {
        id: "browser-use-mouse",
        type: "mouse",
        x: 240,
        y: 88,
        width: 80,
        height: 80,
        rotation: 0,
        buttonOverlays: {
          left: { default: "", active: "" },
          right: { default: "", active: "" },
          middle: { default: "", active: "" }
        },
        ring: {
          size: 80,
          color: "#ffffff",
          images: {
            ring: "",
            pointer: ""
          }
        },
        images: {
          mouseDefault: "",
          mouseLeftClick: "",
          mouseRightClick: "",
          mouseMiddleClick: "",
          mouseScrollUp: "",
          mouseScrollDown: ""
        }
      }
    ]
  };
};

/**
 * Creates the initial config served by the local dev API.
 */
export const createBrowserPreviewConfig = (): ConfigData => {
  return {
    layouts: [createBrowserPreviewLayout()],
    images: []
  };
};
