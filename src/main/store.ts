import Store, { Schema } from "electron-store";

type ConfigSchema = {
  layouts: {
    id: string;
    keys: {
      id: string;
      key: string;
      type: string;
      size: number;
      width: number;
      x: number;
      y: number;
    }[];
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
        keys: {
          type: "array",
          default: [],
          items: {
            type: "object",
            properties: {
              id: {
                type: "string"
              },
              key: {
                type: "string"
              },
              type: {
                type: "string"
              },
              size: {
                type: "number"
              },
              width: {
                type: "number"
              },
              x: {
                type: "number"
              },
              y: {
                type: "number"
              }
            }
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
