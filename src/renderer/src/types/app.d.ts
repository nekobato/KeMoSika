import { KeyboardKeyData } from "@shared/types";

export type KeyboardKeyEdit = {
  keyData: KeyboardKeyData;
};

export type KeyImageType = "keyDefault" | "keyActive";
export type MouseImageType =
  | "mouseDefault"
  | "mouseLeftClick"
  | "mouseRightClick"
  | "mouseMiddleClick"
  | "mouseScrollUp"
  | "mouseScrollDown";

export type InputImageType = KeyImageType | MouseImageType;
