<script setup lang="ts">
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import KeyboardButton from "../components/KeyboardButton.vue";
// import router from "@renderer/router";
import { nanoid } from "nanoid/non-secure";
import { nextTick, ref, watch } from "vue";
import Moveable from "vue3-moveable";
import { computed } from "vue";
import KeyboardKeyConfig from "@renderer/components/pages/config/KeyboardKeyConfig.vue";

const keys = ref<any[]>([
  {
    id: `key-${nanoid()}`,
    key: "A",
    type: "normal",
    x: 0,
    y: 0,
    size: 48,
    width: 48,
    color: "#ff0000",
    isModifying: false
  }
]);
const moveableRef = ref<Moveable>();

const keysCount = computed(() => keys.value.length);

// const startVisualization = () => {
//   router.push("/visualizer");
// };

const addKey = () => {
  keys.value.push({
    id: `key-${nanoid()}`,
    key: "A",
    type: "normal",
    x: 10,
    y: 10,
    size: 48,
    width: 48,
    color: "#ff0000",
    isModifying: false
  });
};

const onDragKey = (e: any) => {
  const key = keys.value.find((key) => key.id === e.target.id);
  if (key) {
    key.x = e.left;
    key.y = e.top;
  }
};

const onDragStart = (e: any) => {
  const key = keys.value.find((key) => key.id === e.target.id);
  if (key) {
    key.isModifying = true;
  }
};

const onDragEnd = (e: any) => {
  const key = keys.value.find((key) => key.id === e.target.id);
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
          :id="key.id"
          :key="key.id"
          class="keyboard-key configurable-key"
          :class="{ modifying: key.isModifying }"
          :key-name="key.key"
          :x="key.x"
          :y="key.y"
          :size="key.size"
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
    <KeyboardKeyConfig />
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
    right: 16px;
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
