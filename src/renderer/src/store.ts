import { defineStore } from "pinia";
import { nanoid } from "nanoid/non-secure";
import { KeyboardKeyEdit } from "./types/app";

export const useStore = defineStore({
  id: "store",
  state: () => ({
    keys: [
      {
        keyData: {
          id: `key-${nanoid()}`,
          type: "key",
          codeMap: ["KeyA"],
          x: 0,
          y: 0,
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
            default: "",
            keyPress: ""
          }
        }
      }
    ] as KeyboardKeyEdit[]
  }),
  actions: {
    async init() {
      const config = await window.ipc.invoke("get:config");
      this.keys = config.keys;
    },
    async addKey(key: KeyboardKeyEdit) {
      this.$state.keys = [...this.keys, key];
      await window.ipc.invoke("set:config", {
        keys: this.keys
      });
    }
  }
});
