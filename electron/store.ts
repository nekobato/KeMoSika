import Store from "electron-store";

export const store = new Store({
  name: "config",
  defaults: {}
});
