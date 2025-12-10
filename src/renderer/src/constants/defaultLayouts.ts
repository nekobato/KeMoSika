import { LayoutData } from "@shared/types";

const keyImages = {
  keyDefault: "key_default",
  keyActive: "key_active",
  keyLocked: ""
};

export const builtInLayouts: LayoutData[] = [
  {
    id: "builtin-fps-baseline",
    name: "FPS テンプレート",
    width: 960,
    height: 320,
    background: {
      color: "#252525",
      image: ""
    },
    keys: [
      {
        id: "key-esc",
        type: "key",
        codeMap: ["escape"],
        width: 52,
        height: 52,
        x: 32,
        y: 24,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Esc",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "key-w",
        type: "key",
        codeMap: ["W"],
        width: 64,
        height: 64,
        x: 220,
        y: 84,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "W",
          x: 0,
          y: 0,
          size: 20,
          color: "#71d4fe"
        }
      },
      {
        id: "key-a",
        type: "key",
        codeMap: ["A"],
        width: 64,
        height: 64,
        x: 160,
        y: 148,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "A",
          x: 0,
          y: 0,
          size: 20,
          color: "#71d4fe"
        }
      },
      {
        id: "key-s",
        type: "key",
        codeMap: ["S"],
        width: 64,
        height: 64,
        x: 220,
        y: 148,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "S",
          x: 0,
          y: 0,
          size: 20,
          color: "#71d4fe"
        }
      },
      {
        id: "key-d",
        type: "key",
        codeMap: ["D"],
        width: 64,
        height: 64,
        x: 280,
        y: 148,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "D",
          x: 0,
          y: 0,
          size: 20,
          color: "#71d4fe"
        }
      },
      {
        id: "key-space",
        type: "key",
        codeMap: ["Space"],
        width: 360,
        height: 52,
        x: 140,
        y: 236,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Space",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "key-shift",
        type: "key",
        codeMap: ["shift"],
        width: 140,
        height: 52,
        x: 24,
        y: 236,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Shift",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "key-ctrl",
        type: "key",
        codeMap: ["control"],
        width: 96,
        height: 52,
        x: 24,
        y: 176,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Ctrl",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "key-tab",
        type: "key",
        codeMap: ["tab"],
        width: 96,
        height: 52,
        x: 24,
        y: 116,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Tab",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "mouse-fps",
        type: "mouse",
        x: 640,
        y: 92,
        width: 120,
        height: 160,
        rotation: 0,
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
  },
  {
    id: "builtin-arrow-basic",
    name: "ナビゲーションテンプレート",
    width: 840,
    height: 320,
    background: {
      color: "#252525",
      image: ""
    },
    keys: [
      {
        id: "key-up",
        type: "key",
        codeMap: ["up"],
        width: 64,
        height: 64,
        x: 540,
        y: 84,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "↑",
          x: 0,
          y: 0,
          size: 20,
          color: "#71d4fe"
        }
      },
      {
        id: "key-left",
        type: "key",
        codeMap: ["left"],
        width: 64,
        height: 64,
        x: 476,
        y: 148,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "←",
          x: 0,
          y: 0,
          size: 20,
          color: "#71d4fe"
        }
      },
      {
        id: "key-down",
        type: "key",
        codeMap: ["down"],
        width: 64,
        height: 64,
        x: 540,
        y: 148,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "↓",
          x: 0,
          y: 0,
          size: 20,
          color: "#71d4fe"
        }
      },
      {
        id: "key-right",
        type: "key",
        codeMap: ["right"],
        width: 64,
        height: 64,
        x: 604,
        y: 148,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "→",
          x: 0,
          y: 0,
          size: 20,
          color: "#71d4fe"
        }
      },
      {
        id: "key-enter",
        type: "key",
        codeMap: ["enter"],
        width: 120,
        height: 64,
        x: 340,
        y: 148,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Enter",
          x: 0,
          y: 0,
          size: 18,
          color: "#71d4fe"
        }
      },
      {
        id: "key-escape-nav",
        type: "key",
        codeMap: ["escape"],
        width: 96,
        height: 52,
        x: 72,
        y: 24,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Esc",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "key-play",
        type: "key",
        codeMap: ["P"],
        width: 96,
        height: 52,
        x: 72,
        y: 96,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Play",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "key-stop",
        type: "key",
        codeMap: ["O"],
        width: 96,
        height: 52,
        x: 72,
        y: 160,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Stop",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "key-next",
        type: "key",
        codeMap: ["N"],
        width: 96,
        height: 52,
        x: 72,
        y: 224,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Next",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      }
    ]
  },
  {
    id: "builtin-macbook-air-2022",
    name: "MacBook Air (2022)",
    width: 1100,
    height: 400,
    background: {
      color: "#252525",
      image: ""
    },
    keys: [
      // Function row
      {
        id: "mba22-esc",
        type: "key",
        codeMap: ["escape"],
        width: 52,
        height: 44,
        x: 20,
        y: 20,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "esc",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num, i) => ({
        id: `mba22-f${num}`,
        type: "key" as const,
        codeMap: [`f${num}`],
        width: 52,
        height: 44,
        x: 80 + i * 60,
        y: 20,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: `F${num}`,
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      })),
      {
        id: "mba22-power",
        type: "key",
        codeMap: ["power"],
        width: 70,
        height: 44,
        x: 820,
        y: 20,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "Touch ID",
          x: 0,
          y: 0,
          size: 12,
          color: "#71d4fe"
        }
      },

      // Number row
      {
        id: "mba22-grave",
        type: "key",
        codeMap: ["`"],
        width: 52,
        height: 52,
        x: 20,
        y: 82,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "`",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      ..."1234567890-=".split("").map((char, i) => ({
        id: `mba22-num-${char}`,
        type: "key" as const,
        codeMap: [char === "-" ? "-" : char === "=" ? "=" : char],
        width: 52,
        height: 52,
        x: 80 + i * 60,
        y: 82,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: char,
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      })),
      {
        id: "mba22-backspace",
        type: "key",
        codeMap: ["backspace"],
        width: 96,
        height: 52,
        x: 800,
        y: 82,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "delete",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },

      // Q row
      {
        id: "mba22-tab",
        type: "key",
        codeMap: ["tab"],
        width: 84,
        height: 52,
        x: 20,
        y: 144,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "tab",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },
      ..."QWERTYUIOP[]".split("").map((char, i) => ({
        id: `mba22-${char.toLowerCase()}`,
        type: "key" as const,
        codeMap: [char],
        width: 52,
        height: 52,
        x: 110 + i * 60,
        y: 144,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: char,
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      })),
      {
        id: "mba22-backslash",
        type: "key",
        codeMap: ["\\"],
        width: 80,
        height: 52,
        x: 830,
        y: 144,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "\\",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },

      // A row
      {
        id: "mba22-capslock",
        type: "key",
        codeMap: ["capslock"],
        width: 96,
        height: 52,
        x: 20,
        y: 206,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "caps",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },
      ..."ASDFGHJKL;\'".split("").map((char, i) => ({
        id: `mba22-${char === "'" ? "quote" : char.toLowerCase()}`,
        type: "key" as const,
        codeMap: [char === "'" ? "'" : char],
        width: 52,
        height: 52,
        x: 120 + i * 60,
        y: 206,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: char,
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      })),
      {
        id: "mba22-enter",
        type: "key",
        codeMap: ["enter"],
        width: 110,
        height: 52,
        x: 780,
        y: 206,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "return",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },

      // Z row
      {
        id: "mba22-shift-left",
        type: "key",
        codeMap: ["shift"],
        width: 120,
        height: 52,
        x: 20,
        y: 268,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "shift",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },
      ..."ZXCVBNM,./".split("").map((char, i) => ({
        id: `mba22-${char === "," ? "comma" : char === "." ? "period" : char === "/" ? "slash" : char.toLowerCase()}`,
        type: "key" as const,
        codeMap: [char],
        width: 52,
        height: 52,
        x: 140 + i * 60,
        y: 268,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: char,
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      })),
      {
        id: "mba22-shift-right",
        type: "key",
        codeMap: ["shift"],
        width: 140,
        height: 52,
        x: 740,
        y: 268,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "shift",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },

      // Space row
      {
        id: "mba22-fn",
        type: "key",
        codeMap: ["fn"],
        width: 70,
        height: 52,
        x: 20,
        y: 330,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "fn",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-ctrl-left",
        type: "key",
        codeMap: ["control"],
        width: 70,
        height: 52,
        x: 90,
        y: 330,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "control",
          x: 0,
          y: 0,
          size: 12,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-option-left",
        type: "key",
        codeMap: ["alt"],
        width: 80,
        height: 52,
        x: 170,
        y: 330,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "option",
          x: 0,
          y: 0,
          size: 12,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-command-left",
        type: "key",
        codeMap: ["control"],
        width: 96,
        height: 52,
        x: 260,
        y: 330,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "command",
          x: 0,
          y: 0,
          size: 12,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-space",
        type: "key",
        codeMap: ["Space"],
        width: 320,
        height: 52,
        x: 360,
        y: 330,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "space",
          x: 0,
          y: 0,
          size: 14,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-command-right",
        type: "key",
        codeMap: ["control"],
        width: 96,
        height: 52,
        x: 700,
        y: 330,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "command",
          x: 0,
          y: 0,
          size: 12,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-option-right",
        type: "key",
        codeMap: ["alt"],
        width: 80,
        height: 52,
        x: 800,
        y: 330,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "option",
          x: 0,
          y: 0,
          size: 12,
          color: "#71d4fe"
        }
      },

      // Arrow cluster
      {
        id: "mba22-arrow-up",
        type: "key",
        codeMap: ["up"],
        width: 52,
        height: 44,
        x: 948,
        y: 300,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "↑",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-arrow-down",
        type: "key",
        codeMap: ["down"],
        width: 52,
        height: 44,
        x: 948,
        y: 348,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "↓",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-arrow-left",
        type: "key",
        codeMap: ["left"],
        width: 52,
        height: 44,
        x: 892,
        y: 348,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "←",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      },
      {
        id: "mba22-arrow-right",
        type: "key",
        codeMap: ["right"],
        width: 52,
        height: 44,
        x: 1004,
        y: 348,
        rotation: 0,
        images: { ...keyImages },
        text: {
          isVisible: true,
          character: "→",
          x: 0,
          y: 0,
          size: 16,
          color: "#71d4fe"
        }
      }
    ]
  }
];
