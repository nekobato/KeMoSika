import type { LayoutData } from "@shared/types";
import { createLayout, createRow, key } from "./layoutBuilder";

const prefix = "ansi87";

export const displayOrder = 4.5;

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
  key("grave", "`", ["`"]),
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
  key("backspace", "Backspace", ["backspace"], 104)
]);

const numberNavRow = createRow(prefix, 82, 930, [
  key("insert", "Ins", ["insert"]),
  key("home", "Home", ["home"]),
  key("pageup", "PgUp", ["pageup"])
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
  key("left-bracket", "[", ["["]),
  key("right-bracket", "]", ["]"]),
  key("backslash", "\\", ["\\"], 80)
]);

const qNavRow = createRow(prefix, 144, 930, [
  key("delete", "Del", ["delete"]),
  key("end", "End", ["end"]),
  key("pagedown", "PgDn", ["pagedown"])
]);

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
  key("quote", "'", ["'"]),
  key("enter", "Enter", ["enter"], 124)
]);

const zRow = createRow(prefix, 268, 20, [
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
  key("shift-right", "Shift", ["shift"], 150)
]);

const bottomRow = createRow(prefix, 330, 20, [
  key("ctrl-left", "Ctrl", ["control"], 70),
  key("meta-left", "Meta", ["meta"], 70),
  key("alt-left", "Alt", ["alt"], 70),
  key("space", "Space", ["Space"], 360),
  key("alt-right", "Alt", ["alt"], 70),
  key("meta-right", "Meta", ["meta"], 70),
  key("menu", "Menu", ["menu"], 70),
  key("ctrl-right", "Ctrl", ["control"], 70)
]);

const arrowRows = [
  ...createRow(prefix, 300, 990, [key("arrow-up", "↑", ["up"])], 44),
  ...createRow(prefix, 348, 934, [
    key("arrow-left", "←", ["left"]),
    key("arrow-down", "↓", ["down"]),
    key("arrow-right", "→", ["right"])
  ], 44)
];

export const ansi87Layout: LayoutData = createLayout({
  id: "builtin-ansi-us-tkl-87",
  name: "ANSI US TKL 87キー",
  width: 1140,
  height: 400,
  keys: [
    functionRow,
    functionNavRow,
    numberRow,
    numberNavRow,
    qRow,
    qNavRow,
    aRow,
    zRow,
    bottomRow,
    arrowRows
  ]
});

export default ansi87Layout;
