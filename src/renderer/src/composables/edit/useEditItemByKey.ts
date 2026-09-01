import { useStore } from "@/store";
import { nanoid } from "nanoid/non-secure";
import type { Ref } from "vue";
import type { LayoutItemData } from "@shared/types";
import { createItemClipboard } from "./itemClipboard";

export const useEditItemByKey = () => {
  const store = useStore();
  const clipboard = createItemClipboard({
    createId: (type) => `${type}-${nanoid()}`
  });

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
    const commandKey = key.toLowerCase();
    const hasCommandModifier = ctrlKey || metaKey;

    // copy
    if (commandKey === "c" && hasCommandModifier && !shiftKey) {
      const activeLayout = store.activeLayout;
      if (!activeLayout || selectedIndexes.length === 0) return {};

      const selectedItems = [...new Set(selectedIndexes)]
        .sort((left, right) => left - right)
        .map((index) => activeLayout.keys[index])
        .filter((item): item is LayoutItemData => Boolean(item));

      if (selectedItems.length > 0) clipboard.copy(selectedItems);
      return {};
    }

    // paste
    if (commandKey === "v" && hasCommandModifier && !shiftKey) {
      const activeLayout = store.activeLayout;
      if (!activeLayout) return {};

      const pastedItems = clipboard.paste();
      if (pastedItems.length === 0) return {};

      const firstPastedIndex = activeLayout.keys.length;
      void store.addItems(activeLayout.id, pastedItems);
      activeKeys.value = pastedItems.map(
        (_, index) => firstPastedIndex + index
      );
      return { shouldUpdateRect: true };
    }

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
