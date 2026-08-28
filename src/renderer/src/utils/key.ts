import { useKeyModifier } from "@vueuse/core";
import { keyboardCodeToInputCode } from "./keyCodes";

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

export const keyboardEventToInputCode = (e: KeyboardEvent): string => {
  // 記録するのは入力されたキーの位置なので、aとA, 1と!は区別しない
  return keyboardCodeToInputCode(e.code);
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
