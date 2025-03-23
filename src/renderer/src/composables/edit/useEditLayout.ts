import { useStore } from "@/store";
import { nanoid } from "nanoid/non-secure";

export const useEditLayout = () => {
  const store = useStore();

  const addKey = () => {
    if (!store.activeLayout) {
      return;
    }
    store.addItem(store.activeLayout.id, {
      id: `key-${nanoid()}`,
      type: "key",
      codeMap: ["A"],
      x: (store.activeLayout?.width || 0) / 2,
      y: (store.activeLayout?.height || 0) / 2,
      width: 48,
      height: 48,
      rotation: 0,
      text: {
        isVisible: true,
        character: "A",
        x: 0,
        y: 0,
        size: 24,
        color: "#71d4fe"
      },
      images: {
        keyDefault: "",
        keyActive: "",
        keyLocked: ""
      }
    });
  };

  const addMouse = () => {
    if (!store.activeLayout) {
      return;
    }
    store.addItem(store.activeLayout.id, {
      id: `mouse-${nanoid()}`,
      type: "mouse",
      x: (store.activeLayout?.width || 0) / 2,
      y: (store.activeLayout?.height || 0) / 2,
      width: 48,
      height: 48,
      rotation: 0,
      images: {
        mouseDefault: "",
        mouseLeftClick: "",
        mouseMiddleClick: "",
        mouseRightClick: "",
        mouseScrollUp: "",
        mouseScrollDown: ""
      }
    });
  };

  return {
    addKey,
    addMouse
  };
};
