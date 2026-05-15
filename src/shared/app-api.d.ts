import type { LayoutData, LayoutItemImage } from "./types";

export type ConfigData = {
  layouts: LayoutData[];
  images: LayoutItemImage[];
};

export type ImageSaveBufferInput = {
  buffer: ArrayBuffer | Uint8Array;
};

export type ImageSaveResult = {
  id: string;
  fileName: string;
};

export type ImageListItem = LayoutItemImage & {
  path: string;
};

export type LayoutExportInput = {
  layoutId: string;
};

export type LayoutExportResult = {
  canceled: boolean;
  filePath?: string;
  imageCount?: number;
};

export type LayoutImportPathInput = {
  path: string;
};

export type LayoutImportArchiveInput = {
  buffer: ArrayBuffer | Uint8Array;
  fileName: string;
};

export type LayoutImportResult = {
  canceled: boolean;
  layoutId?: string;
  layoutName?: string;
  imageCount?: number;
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
  exportLayout: (input: LayoutExportInput) => Promise<LayoutExportResult>;
  selectLayoutImportDirectory: () => Promise<LayoutImportResult>;
  importLayoutFromPath: (
    input: LayoutImportPathInput
  ) => Promise<LayoutImportResult>;
  importLayoutArchive: (
    input: LayoutImportArchiveInput
  ) => Promise<LayoutImportResult>;
  getPathForFile: (file: File) => string;
  saveImageBuffer: (input: ImageSaveBufferInput) => Promise<ImageSaveResult>;
  deleteImage: (id: string) => Promise<ConfigData>;
  listImages: () => Promise<ImageListItem[]>;
  listFonts: () => Promise<string[]>;
  startVisualizer: (options: VisualizerStartOptions) => Promise<boolean>;
  closeVisualizer: () => Promise<boolean>;
  onInput: (listener: InputEventListener) => void;
  onVisualizerStart: (listener: VisualizerStartListener) => void;
  onVisualizerClose: (listener: VoidEventListener) => void;
  resetPreviewData?: () => Promise<ConfigData>;
};
