import { defineStore } from "pinia";
import { KeyboardKeyData } from "@shared/types";
import { computed, ref } from "vue";

type StoreState = {
  activeLayoutIndex: number;
  layouts: {
    id: string;
    name: string;
    keys: KeyboardKeyData[];
  }[];
};

export const useStore = defineStore("store", () => {
  const state = ref<StoreState>({
    activeLayoutIndex: 0,
    layouts: []
  });

  const saveLayout = async () => {
    await window.ipc.invoke(
      "layout:save",
      JSON.parse(
        JSON.stringify(state.value.layouts[state.value.activeLayoutIndex])
      )
    );
  };

  const activeLayout = computed(() => {
    return state.value.layouts[state.value.activeLayoutIndex];
  });

  const init = async () => {
    state.value.layouts = await window.ipc.invoke("layout:get-all");
  };

  const addLayout = async (layout: { id: string; name: string }) => {
    const newLayout = { ...layout, keys: [] };
    state.value.layouts.push(newLayout);
    await window.ipc.invoke("layout:create", newLayout);
  };

  const addKey = async (key: KeyboardKeyData) => {
    state.value.layouts[state.value.activeLayoutIndex].keys.push(key);
    await saveLayout();
  };

  const updateKey = async (key: KeyboardKeyData) => {
    const index = activeLayout.value.keys.findIndex((k) => k.id === key.id);
    state.value.layouts[state.value.activeLayoutIndex].keys[index] = key;
    await saveLayout();
  };
  const removeKeys = async (keyIndexes: number[]) => {
    state.value.layouts[state.value.activeLayoutIndex].keys =
      activeLayout.value.keys.filter((_, index) => !keyIndexes.includes(index));
    // await window.ipc.invoke("set:config", {
    //   keys: state.value.keys
    // });
  };
  return {
    state,
    activeLayout,
    init,
    addLayout,
    addKey,
    updateKey,
    removeKeys
  };
});
