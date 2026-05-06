import type { LayoutData } from "@shared/types";
import { createKeyboardKey, createLayout, createRow, key } from "./layoutBuilder";

const prefix = "jis60";

export const displayOrder = 3;

const numberRow = createRow(prefix, 20, 20, [
  key("esc", "Esc", ["escape"]),
  key("1", "1", ["1"]),
  key("2", "2", ["2"]),
  key("3", "3", ["3"]),
  key("4", "4", ["4"]),
  key("5", "5", ["5"]),
  key("6", "6", ["6"]),
  key("7", "7", ["7"]),
  key("8", "8", ["8"]),
  key("9", "9", ["9"]),
  key("0", "0", ["0"]),
  key("minus", "-", ["-"]),
  key("caret", "^", ["="]),
  key("yen", "¥", ["\\"]),
  key("backspace", "Backspace", ["backspace"], 84)
]);

const qRow = createRow(prefix, 82, 20, [
  key("tab", "Tab", ["tab"], 84),
  key("q", "Q", ["Q"]),
  key("w", "W", ["W"]),
  key("e", "E", ["E"]),
  key("r", "R", ["R"]),
  key("t", "T", ["T"]),
  key("y", "Y", ["Y"]),
  key("u", "U", ["U"]),
  key("i", "I", ["I"]),
  key("o", "O", ["O"]),
  key("p", "P", ["P"]),
  key("at", "@", ["["]),
  key("left-bracket", "[", ["]"])
]);

const jisEnter = createKeyboardKey(prefix, {
  id: "enter",
  label: "Enter",
  codeMap: ["enter"],
  width: 84,
  height: 114,
  x: 844,
  y: 82
});

const aRow = createRow(prefix, 144, 20, [
  key("control", "Ctrl", ["control"], 96),
  key("a", "A", ["A"]),
  key("s", "S", ["S"]),
  key("d", "D", ["D"]),
  key("f", "F", ["F"]),
  key("g", "G", ["G"]),
  key("h", "H", ["H"]),
  key("j", "J", ["J"]),
  key("k", "K", ["K"]),
  key("l", "L", ["L"]),
  key("semicolon", ";", [";"]),
  key("colon", ":", ["'"]),
  key("right-bracket", "]", ["\\"])
]);

const zRow = createRow(prefix, 206, 20, [
  key("shift-left", "Shift", ["shift"], 96),
  key("backslash", "\\", ["\\"]),
  key("z", "Z", ["Z"]),
  key("x", "X", ["X"]),
  key("c", "C", ["C"]),
  key("v", "V", ["V"]),
  key("b", "B", ["B"]),
  key("n", "N", ["N"]),
  key("m", "M", ["M"]),
  key("comma", ",", [","]),
  key("period", ".", ["."]),
  key("slash", "/", ["/"]),
  key("ro", "ろ", ["/"]),
  key("shift-right", "Shift", ["shift"], 112)
]);

const bottomRow = createRow(prefix, 268, 20, [
  key("meta-left", "Meta", ["meta"], 70),
  key("alt-left", "Alt", ["alt"], 70),
  key("muhenkan", "無変換", ["nonconvert"], 76),
  key("space", "Space", ["Space"], 250),
  key("henkan", "変換", ["convert"], 76),
  key("kana", "かな", ["kana"], 70),
  key("alt-right", "Alt", ["alt"], 70),
  key("fn", "Fn", [], 70)
]);

export const jis60Layout: LayoutData = createLayout({
  id: "builtin-jis-60",
  name: "JIS 60% / HHKB JP",
  width: 980,
  height: 330,
  keys: [numberRow, qRow, jisEnter, aRow, zRow, bottomRow]
});

export default jis60Layout;
