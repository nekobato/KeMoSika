import { defineStore } from "pinia";
import { LayoutData, LayoutItemData } from "@shared/types";
import { computed, ref } from "vue";
import { useManualRefHistory, useRefHistory } from "@vueuse/core";

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

  const addLayout = async (layout: LayoutData) => {
    const newLayout = { ...layout, keys: [] };
    layouts.value.push(newLayout);
    await window.ipc.invoke("layout:create", newLayout);
  };

  const addKey = async (key: LayoutItemData) => {
    layouts.value[activeLayoutIndex.value].keys.push(key);
    commit();
    saveLayout();
  };

  const updateKey = async (key: LayoutItemData) => {
    const index = activeLayout.value.keys.findIndex((k) => k.id === key.id);
    layouts.value[activeLayoutIndex.value].keys[index] = key;
    commit();
    saveLayout();
    console.log("updateKey", history.value);
  };

  const removeKeys = async (keyIndexes: number[]) => {
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

  const saveLayout = async () => {
    await window.ipc.invoke(
      "layout:save",
      JSON.parse(JSON.stringify(activeLayout.value))
    );
  };

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
    addKey,
    updateKey,
    removeKeys,
    changeActiveLayout
  };
});
