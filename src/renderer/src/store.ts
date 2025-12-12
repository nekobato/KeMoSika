import { defineStore } from "pinia";
import {
  LayoutData,
  LayoutItemData,
  LayoutItemImage,
  MouseData
} from "@shared/types";
import { computed, ref, toRaw } from "vue";
import { useManualRefHistory } from "@vueuse/core";
import { nanoid } from "nanoid/non-secure";
import { toRawDeep } from "./utils/toRawDeep";
import { builtInLayouts, builtInLayoutTree } from "@/constants/defaultLayouts";

const DEFAULT_RING_COLOR = "#ffffff";

const ensureMouseRing = (mouse: Partial<MouseData>): MouseData["ring"] => {
  const fallbackSize = Math.max(mouse.width ?? 0, mouse.height ?? 0);
  return {
    size: mouse.ring?.size ?? fallbackSize,
    color: mouse.ring?.color ?? DEFAULT_RING_COLOR,
    images: {
      ring: mouse.ring?.images?.ring ?? "",
      pointer: mouse.ring?.images?.pointer ?? ""
    }
  };
};

const ensureButtonOverlays = (
  mouse: Partial<MouseData>
): MouseData["buttonOverlays"] => ({
  left: {
    default: mouse.buttonOverlays?.left?.default ?? "",
    active: mouse.buttonOverlays?.left?.active ?? ""
  },
  right: {
    default: mouse.buttonOverlays?.right?.default ?? "",
    active: mouse.buttonOverlays?.right?.active ?? ""
  },
  middle: {
    default: mouse.buttonOverlays?.middle?.default ?? "",
    active: mouse.buttonOverlays?.middle?.active ?? ""
  }
});

const normalizeLayoutItem = (item: LayoutItemData): LayoutItemData => {
  if (item.type !== "mouse") return item;
  const mouse = item as MouseData;
  return {
    ...mouse,
    buttonOverlays: ensureButtonOverlays(mouse),
    ring: ensureMouseRing(mouse),
    images: {
      mouseDefault: mouse.images?.mouseDefault ?? "",
      mouseLeftClick: mouse.images?.mouseLeftClick ?? "",
      mouseRightClick: mouse.images?.mouseRightClick ?? "",
      mouseMiddleClick: mouse.images?.mouseMiddleClick ?? "",
      mouseScrollUp: mouse.images?.mouseScrollUp ?? "",
      mouseScrollDown: mouse.images?.mouseScrollDown ?? ""
    }
  };
};

const normalizeLayout = (layout: LayoutData): LayoutData => ({
  ...layout,
  keys: layout.keys.map((item) => normalizeLayoutItem(item))
});

const createEmptyLayout = (): LayoutData => ({
  id: nanoid(),
  name: "新しいレイアウト",
  width: 800,
  height: 400,
  background: {
    color: "#252525",
    image: ""
  },
  keys: []
});

const createLayoutFromTemplate = (template?: LayoutData, name?: string) => {
  const base = template ? toRawDeep(template) : createEmptyLayout();
  return normalizeLayout({
    ...base,
    id: nanoid(),
    name: name ?? base.name
  } satisfies LayoutData);
};

export const useStore = defineStore("store", () => {
  // $state
  const activeLayoutIndex = ref<number>(0);
  const layouts = ref<LayoutData[]>([]);
  const images = ref<LayoutItemImage[]>([]);
  const builtinLayoutTree = builtInLayoutTree;

  const activeLayout = computed(() => {
    return layouts.value[activeLayoutIndex.value];
  });

  const init = async () => {
    const config = await window.ipc.invoke("config:get");
    layouts.value = (config.layouts ?? []).map(normalizeLayout);
    images.value = config.images ?? [];

    commit();
  };

  const addLayout = async (template?: LayoutData, name?: string) => {
    const layout = createLayoutFromTemplate(template, name);
    layouts.value.push(layout);
    commit();
    await window.ipc.invoke("layout:save", toRawDeep(layout));
    return layout;
  };

  const updateLayout = async (layout: LayoutData) => {
    layouts.value[activeLayoutIndex.value] = layout;
    commit();
    saveLayout(layout.id);
  };

  const deleteLayout = async (index: number) => {
    await window.ipc.invoke("layout:delete", toRaw(layouts.value[index].id));
    init();
  };

  const saveLayout = async (layoutId: string) => {
    const targetLayout = layouts.value.find((layout) => layout.id === layoutId);
    if (!targetLayout) return;
    await window.ipc.invoke("layout:save", toRawDeep(targetLayout));
  };

  const addItem = async (layoutId: string, key: LayoutItemData) => {
    console.log("addItem", key);
    const targetLayout = layouts.value.find((layout) => layout.id === layoutId);
    if (!targetLayout) return;
    targetLayout.keys.push(normalizeLayoutItem(key));
    commit();
    saveLayout(targetLayout.id);
  };

  const updateItem = async (layoutId: string, key: LayoutItemData) => {
    const targetLayout = layouts.value.find((layout) => layout.id === layoutId);
    if (!targetLayout) return;
    const index = targetLayout.keys.findIndex((k) => k.id === key.id);
    targetLayout.keys.splice(index, 1, normalizeLayoutItem(key));
    commit();
    saveLayout(targetLayout.id);
  };

  const removeItems = async (layoutId: string, keyIndexes: number[]) => {
    const targetLayout = layouts.value.find((layout) => layout.id === layoutId);
    if (!targetLayout) return;
    targetLayout.keys = activeLayout.value.keys.filter(
      (_, index) => !keyIndexes.includes(index)
    );
    commit();
    saveLayout(targetLayout.id);
  };

  const { history, undo, redo, commit } = useManualRefHistory(layouts, {
    clone: true,
    capacity: 50
  });

  const changeActiveLayout = (index: number) => {
    activeLayoutIndex.value = index;
  };

  const getImages = async () => {
    images.value = await window.ipc.invoke("image:list");
  };

  return {
    layouts,
    activeLayoutIndex,
    images,
    undo,
    redo,
    commitHistory: commit,
    history,
    activeLayout,
    init,
    addLayout,
    deleteLayout,
    updateLayout,
    builtinLayouts: builtInLayouts,
    builtinLayoutTree,
    saveLayout,
    addItem,
    updateItem,
    removeItems,
    changeActiveLayout,
    getImages
  };
});
