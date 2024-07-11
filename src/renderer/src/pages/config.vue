<script setup lang="ts">
import KeyboardKeyConfig from "../components/pages/config/KeyboardKeyConfig.vue";
import { nanoid } from "nanoid/non-secure";
import { computed, nextTick, ref, watch } from "vue";
import Moveable from "vue3-moveable";
import KeyboardButton from "../components/KeyboardButton.vue";
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import { KeyboardKeyEdit } from "../types/app";

const keys = ref<KeyboardKeyEdit[]>([
  {
    keyData: {
      id: `key-${nanoid()}`,
      character: "A",
      codeMaps: ["KeyA"],
      x: 0,
      y: 0,
      width: 48,
      height: 48,
      fontSize: 48,
      color: "#ff0000"
    },
    isModifying: false
  }
]);
const activeKeyIndex = ref<number>(0);
const moveableRef = ref<Moveable>();

const keysCount = computed(() => keys.value.length);

// const startVisualization = () => {
//   router.push("/visualizer");
// };

const addKey = () => {
  keys.value.push({
    keyData: {
      id: `key-${nanoid()}`,
      character: "A",
      codeMaps: ["KeyA"],
      x: 10,
      y: 10,
      width: 48,
      height: 48,
      fontSize: 48,
      color: "#ff0000"
    },
    isModifying: false
  });
};

const onDragKey = (e: any) => {
  const key = keys.value.find((key) => key.keyData.id === e.target.id);
  if (key) {
    key.keyData.x = e.left;
    key.keyData.y = e.top;
  }
};

const onDragStart = (e: any) => {
  const key = keys.value.find((key) => key.keyData.id === e.target.id);
  if (key) {
    key.isModifying = true;
  }
};

const onDragEnd = (e: any) => {
  const key = keys.value.find((key) => key.keyData.id === e.target.id);
  if (key) {
    key.isModifying = false;
  }
};

watch(keysCount, () => {
  nextTick(() => {
    moveableRef.value?.updateSelectors();
  });
});
</script>

<template>
  <ConfigLayout>
    <div class="preview">
      <div class="container">
        <KeyboardButton
          v-for="key in keys"
          :id="key.keyData.id"
          :keyData="key.keyData"
          class="keyboard-key configurable-key"
          :class="{ modifying: key.isModifying }"
          :is-down="false"
          :is-modifying="key.isModifying"
        />
        <Moveable
          ref="moveableRef"
          target=".configurable-key"
          :draggable="true"
          :scalable="false"
          :rotatable="false"
          :roundable="false"
          :origin="false"
          :individual-groupable="true"
          :snappable="true"
          :element-guidelines="['.keyboard-key']"
          :hide-default-lines="true"
          @drag="onDragKey"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
        />
      </div>
      <button @click="addKey" class="button type-addkey">ADD KEY</button>
    </div>
    <KeyboardKeyConfig :keyData="keys[activeKeyIndex].keyData" />
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
  height: 100%;
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
    left: 16px;
  }
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
}
.configurable-key {
  cursor: grab;

  &.modifying {
    cursor: grabbing;
  }
}
</style>
