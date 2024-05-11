<script setup lang="ts">
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import Key from "../components/Key.vue";
import router from "@renderer/router";
import { nanoid } from "nanoid/non-secure";
import { ref } from "vue";

const keys = ref([] as any[]);

const startVisualization = () => {
  router.push("/visualizer");
};

const addKey = () => {
  keys.value.push({
    id: nanoid(),
    key: "A",
    type: "normal",
    x: 0,
    y: 0,
    size: 48,
    width: 48,
    color: "#ff0000"
  });
};
</script>

<template>
  <ConfigLayout>
    <div class="preview">
      <Key
        v-for="key in keys"
        :key="key.id"
        :key-name="key.key"
        :x="key.x"
        :y="key.y"
        :size="key.size"
        :is-down="false"
        :is-modifying="false"
      />
      <button @click="startVisualization" class="button type-start">
        START
      </button>
      <button @click="addKey" class="button type-addkey">ADD KEY</button>
    </div>
  </ConfigLayout>
</template>

<style scoped lang="scss">
.key-config {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: scroll;
}
.preview {
  position: relative;
  width: 100%;
}

.start-button {
  position: absolute;
  bottom: 16px;
  right: 16px;
}
.button {
  width: 160px;
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  background: #e6e6e6;
  border: 2px solid #e6e6e6;
  padding: 0 24px;
  color: #444444;
  border-radius: 20px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  margin: auto;

  &:hover {
    background: #cacaca;
  }

  &.type-start {
    bottom: 16px;
    right: 0;
    left: 0;
  }

  &.type-addkey {
    bottom: 16px;
    right: 16px;
  }
}
</style>
