export type KeyboardKeyData = {
  id: string;
  character: string;
  codeMaps: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
};

export type KeyboardKeyEdit = {
  keyData: KeyboardKeyData;
  isModifying: boolean;
};
