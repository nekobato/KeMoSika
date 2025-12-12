import { KeyboardKeyData } from "@shared/types";

export type KeyboardKeyEdit = {
  keyData: KeyboardKeyData;
};

export type KeyImageType = "keyDefault" | "keyActive";
export type MouseBodyImageType =
  | "mouseDefault"
  | "mouseLeftClick"
  | "mouseRightClick"
  | "mouseMiddleClick"
  | "mouseScrollUp"
  | "mouseScrollDown";
export type MouseRingImageType = "ring" | "pointer";
export type MouseOverlayImageType =
  | "leftDefault"
  | "leftActive"
  | "rightDefault"
  | "rightActive"
  | "middleDefault"
  | "middleActive";
export type MouseImageType =
  | MouseBodyImageType
  | MouseRingImageType
  | MouseOverlayImageType;

export type InputImageType = KeyImageType | MouseImageType;
