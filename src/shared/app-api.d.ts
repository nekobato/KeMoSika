import type { LayoutData, LayoutItemImage } from "./types";

export type ConfigData = {
  layouts: LayoutData[];
  images: LayoutItemImage[];
};

export type ImageSaveInput = {
  imagePath?: string;
};

export type ImageSaveResult = {
  id: string;
  fileName: string;
};

export type ImageListItem = LayoutItemImage & {
  path: string;
};

export type VisualizerStartOptions = {
  layoutId: string;
  size: {
    width: number;
    height: number;
  };
};

export type InputEventListener = (event: unknown) => void;

export type VisualizerStartListener = (
  options: VisualizerStartOptions
) => void;

export type VoidEventListener = () => void;

export type AppApi = {
  startInputHook: () => Promise<boolean>;
  stopInputHook: () => Promise<boolean>;
  getConfig: () => Promise<ConfigData>;
  setConfig: (data: ConfigData) => Promise<ConfigData>;
  getLayouts: () => Promise<LayoutData[]>;
  saveLayout: (layout: LayoutData) => Promise<ConfigData>;
  deleteLayout: (id: string) => Promise<ConfigData>;
  saveImage: (input: ImageSaveInput) => Promise<ImageSaveResult>;
  deleteImage: (id: string) => Promise<ConfigData>;
  listImages: () => Promise<ImageListItem[]>;
  startVisualizer: (options: VisualizerStartOptions) => Promise<boolean>;
  closeVisualizer: () => Promise<boolean>;
  onInput: (listener: InputEventListener) => void;
  onVisualizerStart: (listener: VisualizerStartListener) => void;
  onVisualizerClose: (listener: VoidEventListener) => void;
  resetPreviewData?: () => Promise<ConfigData>;
};
