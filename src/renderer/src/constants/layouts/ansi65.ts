import type { LayoutData } from "@shared/types";
import { createLayout, createRow, key } from "./layoutBuilder";

const prefix = "ansi65";

export const displayOrder = 5.5;

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
  key("equals", "=", ["="]),
  key("backspace", "Backspace", ["backspace"], 84),
  key("delete", "Del", ["delete"])
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
  key("left-bracket", "[", ["["]),
  key("right-bracket", "]", ["]"]),
  key("backslash", "\\", ["\\"], 60),
  key("pageup", "PgUp", ["pageup"])
]);

const aRow = createRow(prefix, 144, 20, [
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
  key("quote", "'", ["'"]),
  key("enter", "Enter", ["enter"], 104),
  key("pagedown", "PgDn", ["pagedown"])
]);

const zRow = createRow(prefix, 206, 20, [
  key("shift-left", "Shift", ["shift"], 120),
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
  key("shift-right", "Shift", ["shift"], 120),
  key("arrow-up", "↑", ["up"]),
  key("end", "End", ["end"])
]);

const bottomRow = createRow(prefix, 268, 20, [
  key("ctrl-left", "Ctrl", ["control"], 64),
  key("meta-left", "Meta", ["meta"], 64),
  key("alt-left", "Alt", ["alt"], 64),
  key("space", "Space", ["Space"], 300),
  key("alt-right", "Alt", ["alt"], 64),
  key("fn", "Fn", [], 64),
  key("ctrl-right", "Ctrl", ["control"], 64),
  key("arrow-left", "←", ["left"]),
  key("arrow-down", "↓", ["down"]),
  key("arrow-right", "→", ["right"])
]);

export const ansi65Layout: LayoutData = createLayout({
  id: "builtin-ansi-us-65",
  name: "ANSI US 65%",
  width: 1020,
  height: 340,
  keys: [numberRow, qRow, aRow, zRow, bottomRow]
});

export default ansi65Layout;
