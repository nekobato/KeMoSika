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
  | "middleActive"
  | "x1Default"
  | "x1Active"
  | "x2Default"
  | "x2Active";
export type MouseImageType =
  | MouseBodyImageType
  | MouseRingImageType
  | MouseOverlayImageType;

export type InputImageType = KeyImageType | MouseImageType;
