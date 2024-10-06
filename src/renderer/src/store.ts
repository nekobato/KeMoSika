import { defineStore } from "pinia";
import { LayoutData, LayoutItemData } from "@shared/types";
import { computed, ref } from "vue";
import { useManualRefHistory } from "@vueuse/core";
import { nanoid } from "nanoid/non-secure";

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

  const activeLayout = computed(() => {
    return layouts.value[activeLayoutIndex.value];
  });

  const init = async () => {
    layouts.value = await window.ipc.invoke("layout:get-all");
    commit();
  };

  const addLayout = async () => {
    layouts.value.push(defaultLayout);
    await window.ipc.invoke("layout:save", defaultLayout);
  };

  const updateLayout = async (layout: LayoutData) => {
    layouts.value[activeLayoutIndex.value] = layout;
    commit();
    saveLayout();
  };

  const saveLayout = async () => {
    await window.ipc.invoke(
      "layout:save",
      JSON.parse(JSON.stringify(activeLayout.value))
    );
  };

  const addItem = async (key: LayoutItemData) => {
    layouts.value[activeLayoutIndex.value].keys.push(key);
    commit();
    saveLayout();
  };

  const updateItem = async (key: LayoutItemData) => {
    const index = activeLayout.value.keys.findIndex((k) => k.id === key.id);
    layouts.value[activeLayoutIndex.value].keys[index] = key;
    commit();
    saveLayout();
    console.log("updateKey", history.value);
  };

  const removeItems = async (keyIndexes: number[]) => {
    layouts.value[activeLayoutIndex.value].keys =
      activeLayout.value.keys.filter((_, index) => !keyIndexes.includes(index));
    // await window.ipc.invoke("set:config", {
    //   keys: state.value.keys
    // });
    commit();
    saveLayout();
  };

  const { history, undo, redo, commit } = useManualRefHistory(layouts, {
    clone: true,
    capacity: 50
  });

  const changeActiveLayout = (index: number) => {
    activeLayoutIndex.value = index;
  };

  return {
    layouts,
    activeLayoutIndex,
    undo,
    redo,
    commitHistory: commit,
    history,
    activeLayout,
    init,
    addLayout,
    updateLayout,
    saveLayout,
    addItem,
    updateItem,
    removeItems,
    changeActiveLayout
  };
});
