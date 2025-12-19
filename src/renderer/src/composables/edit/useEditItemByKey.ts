import { useStore } from "@/store";
import type { Ref } from "vue";

export const useEditItemByKey = () => {
  const store = useStore();

  const updateItemByKey = (
    {
      key,
      shiftKey,
      ctrlKey,
      metaKey
    }: {
      key: string;
      shiftKey: boolean;
      ctrlKey: boolean;
      metaKey: boolean;
    },
    activeKeys: Ref<number[]>
  ) => {
    let shouldUpdateRect = false;
    const selectedIndexes = activeKeys.value;

    // delete key
    if (key === "Delete" || key === "Backspace") {
      if (selectedIndexes.length > 0 && store.activeLayout) {
        store.removeItems(store.activeLayout.id, selectedIndexes);
        activeKeys.value = [];
        shouldUpdateRect = true;
      }
    }

    // undo
    if (key === "z" && (ctrlKey || metaKey) && !shiftKey) {
      // [0] is empty initial state
      if (store.history && store.history.length > 2) {
        activeKeys.value = [];
        store.undo();
        shouldUpdateRect = true;
      }
    }

    // redo
    if (key === "z" && (ctrlKey || metaKey) && shiftKey) {
      // [0] is empty initial state
      if (store.history && store.history.length > 2) {
        activeKeys.value = [];
        store.redo();
        shouldUpdateRect = true;
      }
    }

    // move
    if (key === "ArrowUp" || key === "ArrowDown") {
      if (selectedIndexes.length === 0) {
        return {};
      }
      let move = key === "ArrowUp" ? -1 : 1;
      move *= shiftKey ? 10 : 1;
      selectedIndexes.forEach((index) => {
        store.activeLayout.keys[index].y += move;
      });
      shouldUpdateRect = true;
    }

    if (key === "ArrowLeft" || key === "ArrowRight") {
      if (selectedIndexes.length === 0) {
        return {};
      }
      let move = key === "ArrowLeft" ? -1 : 1;
      move *= shiftKey ? 10 : 1;
      selectedIndexes.forEach((index) => {
        store.activeLayout.keys[index].x += move;
      });
      shouldUpdateRect = true;
    }

    return { shouldUpdateRect };
  };

  return {
    updateItemByKey
  };
};
