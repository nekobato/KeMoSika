import { defineStore } from "pinia";
import { Key } from "./types/app";

export const useStore = defineStore({
  id: "store",
  state: () => ({
    keys: [] as Key[]
  }),
  actions: {
    async init() {
      const config = await window.ipc.invoke("get:config");
      this.keys = config.keys;
    },
    async addKey(key: Key) {
      this.keys.push(key);
      await window.ipc.invoke("set:config", {
        keys: this.keys.map((k) => ({ ...k }))
      });
    }
  }
});
