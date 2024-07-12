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
          character: "A",
          codeMaps: ["KeyA"],
          x: 0,
          y: 0,
          width: 48,
          height: 48,
          fontSize: 24,
          color: "#ff0000"
        },
        isModifying: false
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
