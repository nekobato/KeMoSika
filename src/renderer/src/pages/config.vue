<script setup lang="ts">
import KeyboardKeyConfig from "../components/pages/config/KeyboardKeyConfig.vue";
import { nanoid } from "nanoid/non-secure";
import { computed, nextTick, ref, watch } from "vue";
import Moveable from "vue3-moveable";
import Selecto from "vue3-selecto";
import KeyboardButton from "../components/KeyboardButton.vue";
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import { useStore } from "../store";
import router from "../router";

const store = useStore();
const activeKeyIndexes = ref<number[]>([0]);
const previewRef = ref<HTMLDivElement>();
const moveableRef = ref<Moveable>();

const keysCount = computed(() => store.$state.keys.length);
const keys = computed(() => store.$state.keys);
const keyIdSelectors = computed(() =>
  keys.value.map((key) => `#${key.keyData.id}`)
);

const startVisualization = () => {
  router.push("/visualizer");
};

const addKey = () => {
  store.$state.keys.push({
    keyData: {
      id: `key-${nanoid()}`,
      type: "key",
      codeMap: ["KeyA"],
      x: 0,
      y: 0,
      width: 48,
      height: 48,
      rotation: 0,
      text: {
        isVisible: true,
        character: "A",
        x: 0,
        y: 0,
        size: 24,
        color: "#71d4fe"
      },
      images: {
        default: "",
        keyPress: ""
      }
    }
  });
};

const onDrag = (e: any) => {
  const key = keys.value.find((key) => key.keyData.id === e.target.id);
  if (key) {
    key.keyData.x = e.left;
    key.keyData.y = e.top;
  }
};

const onDragStart = (e: any) => {
  const key = keys.value.find((key) => key.keyData.id === e.target.id);
  if (key) {
    // key.isModifying = true;
  }
};

const onDragEnd = (e: any) => {
  const key = keys.value.find((key) => key.keyData.id === e.target.id);
  if (key) {
    // key.isModifying = false;
  }
};

const onDragGroup = (e: any) => {
  e.events.forEach((ev: any) => {
    const key = keys.value.find((key) => key.keyData.id === ev.target.id);
    if (key) {
      key.keyData.x = ev.left;
      key.keyData.y = ev.top;
    }
  });
};

const onSelectEnd = (e: any) => {
  const selectedKeys = keys.value.filter((key) =>
    e.selected.some((el: any) => el.id === key.keyData.id)
  );

  // moveableRef.value.dragStart();
  moveableRef.value.waitToChangeTarget().then(() => {
    moveableRef.value.dragStart(e.inputEvent);
  });
  activeKeyIndexes.value = selectedKeys.map((key) => keys.value.indexOf(key));
  console.log(selectedKeys);
};

watch(keysCount, () => {
  nextTick(() => {
    moveableRef.value.updateSelectors();
    moveableRef.value.updateRect();
  });
});
</script>

<template>
  <ConfigLayout>
    <div class="preview" ref="previewRef">
      <div class="container">
        <KeyboardButton
          v-for="key in keys"
          class="keyboard-key configurable-key"
          :id="key.keyData.id"
          :key-data="key.keyData"
          :is-down="false"
        />
        <Moveable
          ref="moveableRef"
          :target="keyIdSelectors"
          :draggable="true"
          :scalable="false"
          :rotatable="false"
          :roundable="false"
          :snappable="true"
          :origin="false"
          :element-guidelines="keyIdSelectors"
          :individual-groupable="true"
          :hide-default-lines="true"
          @drag="onDrag"
          @drag-group="onDragGroup"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
        />
        <Selecto
          :container="previewRef"
          :drag-container="previewRef"
          :selectable-targets="keyIdSelectors"
          :selectBy-click="true"
          :select-from-inside="false"
          :continue-select="false"
          :toggle-continue-select="['shift']"
          @select-end="onSelectEnd"
        />
      </div>
      <button @click="addKey" class="button type-addkey">ADD KEY</button>
      <button @click="startVisualization" class="button type-start">
        START
      </button>
    </div>
    <KeyboardKeyConfig
      :keyData="
        activeKeyIndexes.length > 0
          ? keys[activeKeyIndexes[0]].keyData
          : undefined
      "
    />
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
