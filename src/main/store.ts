import Store, { Schema } from "electron-store";
import { LayoutItemData } from "@shared/types";

type ConfigSchema = {
  layouts: {
    id: string;
    name: string;
    keys: LayoutItemData[];
  }[];
};

const schema: Schema<ConfigSchema> = {
  layouts: {
    type: "array",
    default: [],
    items: {
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        name: {
          type: "string"
        },
        keys: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string"
              },
              id: {
                type: "string"
              },
              x: {
                type: "number"
              },
              y: {
                type: "number"
              },
              width: {
                type: "number"
              },
              height: {
                type: "number"
              },
              images: {
                type: "object",
                properties: {
                  keyDefault: {
                    type: "string"
                  },
                  keyActive: {
                    type: "string"
                  },
                  mouseDefault: {
                    type: "string"
                  },
                  mouseLeftClick: {
                    type: "string"
                  },
                  mouseRightClick: {
                    type: "string"
                  },
                  mouseMiddleClick: {
                    type: "string"
                  },
                  mousesScrollUp: {
                    type: "string"
                  },
                  mousesScrollDown: {
                    type: "string"
                  }
                }
              },
              text: {
                type: "object",
                properties: {
                  character: {
                    type: "string"
                  },
                  x: {
                    type: "number"
                  },
                  y: {
                    type: "number"
                  },
                  size: {
                    type: "number"
                  },
                  color: {
                    type: "string"
                  },
                  font: {
                    type: "string"
                  }
                }
              }
            },
            required: ["type", "id", "x", "y", "width", "height"]
          }
        }
      }
    }
  }
};

export const store = new Store({
  name: "config",
  schema: schema,
  defaults: {
    layouts: []
  }
});

export const getStore = () => store.store;

export const setStore = (data: ConfigSchema) => (store.store = data);
