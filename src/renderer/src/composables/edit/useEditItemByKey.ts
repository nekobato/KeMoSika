import { useStore } from "@/store";

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
    activeKeys: any[]
  ) => {
    let shouldUpdateRect = false;

    // delete key
    if (key === "Delete" || key === "Backspace") {
      if (activeKeys.length > 0 && store.activeLayout) {
        store.removeItems(store.activeLayout.id, activeKeys);
        activeKeys = [];
        shouldUpdateRect = true;
      }
    }

    // undo
    if (key === "z" && (ctrlKey || metaKey) && !shiftKey) {
      // [0] is empty initial state
      if (store.history && store.history.length > 2) {
        activeKeys = [];
        store.undo();
        shouldUpdateRect = true;
      }
    }

    // redo
    if (key === "z" && (ctrlKey || metaKey) && shiftKey) {
      // [0] is empty initial state
      if (store.history && store.history.length > 2) {
        activeKeys = [];
        store.redo();
        shouldUpdateRect = true;
      }
    }

    // move
    if (key === "ArrowUp" || key === "ArrowDown") {
      if (activeKeys.length === 0) {
        return {};
      }
      let move = key === "ArrowUp" ? -1 : 1;
      move *= shiftKey ? 10 : 1;
      activeKeys.forEach((index) => {
        store.activeLayout.keys[index].y += move;
      });
      shouldUpdateRect = true;
    }

    if (key === "ArrowLeft" || key === "ArrowRight") {
      if (activeKeys.length === 0) {
        return {};
      }
      let move = key === "ArrowLeft" ? -1 : 1;
      move *= shiftKey ? 10 : 1;
      activeKeys.forEach((index) => {
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
