import Store, { Schema } from "electron-store";
import { LayoutItemData } from "@shared/types";

type ConfigSchema = {
  layouts: {
    id: string;
    name: string;
    items: LayoutItemData[];
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
        items: {
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
                  default: {
                    type: "string"
                  },
                  keyPress: {
                    type: "string"
                  },
                  leftClick: {
                    type: "string"
                  },
                  rightClick: {
                    type: "string"
                  },
                  middleClick: {
                    type: "string"
                  },
                  scrollUp: {
                    type: "string"
                  },
                  scrollDown: {
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
