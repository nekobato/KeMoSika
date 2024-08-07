import { useKeyModifier } from "@vueuse/core";

export const keyboardEventToShortcut = (e: KeyboardEvent): string => {
  const shortcut = [];
  if (e.metaKey) {
    shortcut.push("Meta");
  }
  if (e.ctrlKey) {
    shortcut.push("Ctrl");
  }
  if (e.altKey) {
    shortcut.push("Alt");
  }
  if (e.shiftKey) {
    shortcut.push("Shift");
  }
  if (e.code === "Space") {
    shortcut.push("Space");
  } else if (e.code === "Escape") {
    shortcut.push("Escape");
  }
  shortcut.push(e.key);
  return shortcut.join("+");
};

export const keyboardEventToElectronAccelerator = (
  e: KeyboardEvent
): string => {
  let keyCode = e.code;
  keyCode = keyCode.replace("Key", "");
  // 記録するのは入力されたキーの位置なので、aとA, 1と!は区別しない
  return keyCode;
};

export const useKeyModifiers = () => {
  const capsLock = useKeyModifier("CapsLock");
  const numLock = useKeyModifier("NumLock");
  const scrollLock = useKeyModifier("ScrollLock");
  const shift = useKeyModifier("Shift");
  const control = useKeyModifier("Control");
  const alt = useKeyModifier("Alt");
  return { capsLock, numLock, scrollLock, shift, control, alt };
};

export const keyCodeMap: Record<number, string> = {
  1: "escape",
  2: "1",
  3: "2",
  4: "3",
  5: "4",
  6: "5",
  7: "6",
  8: "7",
  9: "8",
  10: "9",
  11: "0",
  12: "-",
  13: "=",
  14: "backspace",
  15: "tab",
  16: "Q",
  17: "W",
  18: "E",
  19: "R",
  20: "T",
  21: "Y",
  22: "U",
  23: "I",
  24: "O",
  25: "P",
  26: "[",
  27: "]",
  28: "enter",
  29: "control",
  30: "A",
  31: "S",
  32: "D",
  33: "F",
  34: "G",
  35: "H",
  36: "J",
  37: "K",
  38: "L",
  39: ";",
  40: "'",
  41: "`",
  42: "shift",
  43: "\\",
  44: "Z",
  45: "X",
  46: "C",
  47: "V",
  48: "B",
  49: "N",
  50: "M",
  51: ",",
  52: ".",
  53: "/",
  54: "shift",
  55: "*",
  56: "alt",
  57: "space",
  58: "capslock",
  59: "f1",
  60: "f2",
  61: "f3",
  62: "f4",
  63: "f5",
  64: "f6",
  65: "f7",
  66: "f8",
  67: "f9",
  68: "f10",
  69: "numlock",
  70: "scrolllock",
  71: "numpad7",
  72: "numpad8",
  73: "numpad9",
  74: "numpad-",
  75: "numpad4",
  76: "numpad5",
  77: "numpad6",
  78: "numpad+",
  79: "numpad1",
  80: "numpad2",
  81: "numpad3",
  82: "numpad0",
  83: "numpad.",
  87: "f11",
  88: "f12",
  100: "numpadenter",
  102: "control",
  103: "/",
  104: "sysrq",
  105: "alt",
  106: "home",
  107: "up",
  108: "pageup",
  109: "left",
  110: "right",
  111: "end",
  112: "down",
  113: "pagedown",
  114: "insert",
  115: "delete",
  116: "null",
  117: "null",
  118: "null",
  119: "f13",
  120: "f14",
  121: "f15",
  122: "f16",
  123: "f17",
  124: "f18",
  125: "f19",
  126: "f20",
  127: "f21",
  128: "f22",
  129: "f23",
  130: "f24"
};
