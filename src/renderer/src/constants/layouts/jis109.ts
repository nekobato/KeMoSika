import type { LayoutData } from "@shared/types";
import { createKeyboardKey, createLayout, createRow, key } from "./layoutBuilder";

const prefix = "jis109";

export const displayOrder = 1;

const functionRow = createRow(prefix, 20, 20, [
  key("esc", "Esc", ["escape"]),
  key("f1", "F1", ["f1"]),
  key("f2", "F2", ["f2"]),
  key("f3", "F3", ["f3"]),
  key("f4", "F4", ["f4"]),
  key("f5", "F5", ["f5"]),
  key("f6", "F6", ["f6"]),
  key("f7", "F7", ["f7"]),
  key("f8", "F8", ["f8"]),
  key("f9", "F9", ["f9"]),
  key("f10", "F10", ["f10"]),
  key("f11", "F11", ["f11"]),
  key("f12", "F12", ["f12"])
], 44);

const functionNavRow = createRow(prefix, 20, 930, [
  key("printscreen", "Prt", ["sysrq"]),
  key("scrolllock", "Scr", ["scrolllock"]),
  key("pause", "Pause", ["pause"])
], 44);

const numberRow = createRow(prefix, 82, 20, [
  key("zenkaku", "半/全", ["`"]),
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
  key("yen", "¥", ["\\"], 52),
  key("backspace", "Backspace", ["backspace"], 84)
]);

const numberNavRow = createRow(prefix, 82, 1000, [
  key("insert", "Ins", ["insert"]),
  key("home", "Home", ["home"]),
  key("pageup", "PgUp", ["pageup"])
]);

const numpadTopRow = createRow(prefix, 82, 1230, [
  key("numlock", "Num", ["numlock"]),
  key("numpad-divide", "/", ["/"]),
  key("numpad-multiply", "*", ["*"]),
  key("numpad-minus", "-", ["numpad-"])
]);

const qRow = createRow(prefix, 144, 20, [
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
  y: 144
});

const qNavRow = createRow(prefix, 144, 1000, [
  key("delete", "Del", ["delete"]),
  key("end", "End", ["end"]),
  key("pagedown", "PgDn", ["pagedown"])
]);

const numpadMiddleTopRow = createRow(prefix, 144, 1230, [
  key("numpad7", "7", ["numpad7"]),
  key("numpad8", "8", ["numpad8"]),
  key("numpad9", "9", ["numpad9"])
]);

const numpadPlus = createKeyboardKey(prefix, {
  id: "numpad-plus",
  label: "+",
  codeMap: ["numpad+"],
  width: 52,
  height: 114,
  x: 1410,
  y: 144
});

const aRow = createRow(prefix, 206, 20, [
  key("capslock", "Caps", ["capslock"], 96),
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

const numpadMiddleRow = createRow(prefix, 206, 1230, [
  key("numpad4", "4", ["numpad4"]),
  key("numpad5", "5", ["numpad5"]),
  key("numpad6", "6", ["numpad6"])
]);

const zRow = createRow(prefix, 268, 20, [
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

const arrowUpRow = createRow(prefix, 300, 1060, [
  key("arrow-up", "↑", ["up"])
], 44);

const numpadLowerRow = createRow(prefix, 268, 1230, [
  key("numpad1", "1", ["numpad1"]),
  key("numpad2", "2", ["numpad2"]),
  key("numpad3", "3", ["numpad3"])
]);

const numpadEnter = createKeyboardKey(prefix, {
  id: "numpad-enter",
  label: "Enter",
  codeMap: ["numpadenter"],
  width: 52,
  height: 114,
  x: 1410,
  y: 268
});

const bottomRow = createRow(prefix, 330, 20, [
  key("ctrl-left", "Ctrl", ["control"], 70),
  key("meta-left", "Meta", ["meta"], 70),
  key("alt-left", "Alt", ["alt"], 70),
  key("muhenkan", "無変換", ["nonconvert"], 76),
  key("space", "Space", ["Space"], 220),
  key("henkan", "変換", ["convert"], 76),
  key("kana", "かな", ["kana"], 70),
  key("alt-right", "Alt", ["alt"], 70),
  key("meta-right", "Meta", ["meta"], 70),
  key("ctrl-right", "Ctrl", ["control"], 70)
]);

const arrowBottomRow = createRow(prefix, 348, 1004, [
  key("arrow-left", "←", ["left"]),
  key("arrow-down", "↓", ["down"]),
  key("arrow-right", "→", ["right"])
], 44);

const numpadBottomRow = createRow(prefix, 330, 1230, [
  key("numpad0", "0", ["numpad0"], 112),
  key("numpad-decimal", ".", ["numpad."])
]);

export const jis109Layout: LayoutData = createLayout({
  id: "builtin-jis-109",
  name: "JIS 109キー",
  width: 1500,
  height: 420,
  keys: [
    functionRow,
    functionNavRow,
    numberRow,
    numberNavRow,
    numpadTopRow,
    qRow,
    jisEnter,
    qNavRow,
    numpadMiddleTopRow,
    numpadPlus,
    aRow,
    numpadMiddleRow,
    zRow,
    arrowUpRow,
    numpadLowerRow,
    numpadEnter,
    bottomRow,
    arrowBottomRow,
    numpadBottomRow
  ]
});

export default jis109Layout;
