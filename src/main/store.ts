import Store, { Schema } from "electron-store";
import { LayoutItemData, LayoutItemImage } from "@shared/types";

type ConfigSchema = {
  layouts: {
    id: string;
    name: string;
    keys: LayoutItemData[];
  }[];
  images: LayoutItemImage[];
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
  },
  images: {
    type: "array",
    default: [],
    items: {
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        fileName: {
          type: "string"
        }
      },
      required: ["id", "fileName"]
    }
  }
};

export const store = new Store({
  name: "config",
  schema: schema,
  defaults: {
    layouts: [],
    images: []
  }
});

export const getStore = () => store.store;

export const setStore = (data: ConfigSchema) => (store.store = data);

export const setLayouts = (layouts: ConfigSchema["layouts"]) => {
  store.set("layouts", layouts);
};

export const setLayout = (layout: ConfigSchema["layouts"][0]) => {
  const layouts = store.get("layouts");
  const index = layouts.findIndex((item) => item.id === layout.id);
  if (index === -1) {
    layouts.push(layout);
  } else {
    layouts[index] = layout;
  }
  store.set("layouts", layouts);
};

export const setImages = (images: ConfigSchema["images"]) => {
  store.set("images", images);
};
