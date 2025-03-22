import { defineStore } from "pinia";
import { LayoutData, LayoutItemData, LayoutItemImage } from "@shared/types";
import { computed, ref, toRaw } from "vue";
import { useManualRefHistory } from "@vueuse/core";
import { nanoid } from "nanoid/non-secure";
import { toRawDeep } from "./utils/toRawDeep";

const defaultLayout: LayoutData = {
  id: nanoid(),
  name: "新しいレイアウト",
  width: 800,
  height: 400,
  background: {
    color: "#252525",
    image: ""
  },
  keys: []
};

export const useStore = defineStore("store", () => {
  // $state
  const activeLayoutIndex = ref<number>(0);
  const layouts = ref<LayoutData[]>([]);
  const images = ref<LayoutItemImage[]>([]);

  const activeLayout = computed(() => {
    return layouts.value[activeLayoutIndex.value];
  });

  const init = async () => {
    const config = await window.ipc.invoke("config:get");
    layouts.value = config.layouts;
    images.value = config.images;

    commit();
  };

  const addLayout = async () => {
    layouts.value.push(defaultLayout);
    await window.ipc.invoke("layout:save", defaultLayout);
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
    targetLayout.keys.push(key);
    commit();
    saveLayout(targetLayout.id);
  };

  const updateItem = async (layoutId: string, key: LayoutItemData) => {
    const targetLayout = layouts.value.find((layout) => layout.id === layoutId);
    if (!targetLayout) return;
    const index = targetLayout.keys.findIndex((k) => k.id === key.id);
    targetLayout.keys.splice(index, 1, key);
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
    saveLayout,
    addItem,
    updateItem,
    removeItems,
    changeActiveLayout,
    getImages
  };
});
