<script setup lang="ts">
import KeyboardKeyConfig from "../components/pages/config/KeyboardKeyConfig.vue";
import { nanoid } from "nanoid/non-secure";
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import Moveable from "vue3-moveable";
import Selecto from "vue3-selecto";
import KeyboardButton from "../components/KeyboardButton.vue";
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import { useStore } from "../store";
import router from "../router";
import { KeyboardKeyData } from "@shared/types";
import { onMounted } from "vue";
import { Icon } from "@iconify/vue";

const store = useStore();
const activeKeyIndexes = ref<number[]>([]);
const previewRef = ref<HTMLDivElement>();
const moveableRef = ref<Moveable>();
const selectoRef = ref<Selecto>();

const layout = computed(
  () => store.state.layouts[store.state.activeLayoutIndex]
);
const keys = computed(
  () => store.state.layouts[store.state.activeLayoutIndex]?.keys
);
const keysCount = computed(() => keys.value?.length);
const keyIdSelectors = computed(() => {
  return activeKeyIndexes.value.map((index) => `#${keys.value[index].id}`);
});

const startVisualization = () => {
  router.push("/visualizer");
};

const addKey = () => {
  store.addKey({
    id: `key-${nanoid()}`,
    type: "key",
    codeMap: ["A"],
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
      keyDefault: "",
      keyActive: "",
      mouseDefault: "",
      mouseLeftClick: "",
      mouseMiddleClick: "",
      mouseRightClick: "",
      mouseScrollUp: "",
      mouseScrollDown: ""
    }
  });
};

const onClickGroup = (e: any) => {
  selectoRef.value.clickTarget(e.inputEvent, e.inputTarget);
};

const onDrag = (e: any) => {
  const key = keys.value.find((key) => key.id === e.target.id);
  if (key) {
    key.x = e.left;
    key.y = e.top;
  }
};

const onDragStart = (e: any) => {
  const key = keys.value.find((key) => key.id === e.target.id);
  if (key) {
    // key.isModifying = true;
  }
};

const onDragEnd = (e: any) => {
  const key = keys.value.find((key) => key.id === e.target.id);

  if (key) {
    // key.isModifying = false;
  }
};

const onDragGroup = (e: any) => {
  e.events.forEach((ev: any) => {
    const key = keys.value.find((key) => key.id === ev.target.id);
    if (key) {
      key.x = ev.left;
      key.y = ev.top;
    }
  });
};

const onRotate = (e: any) => {
  e.inputEvent.preventDefault();
  const key = keys.value.find((key) => key.id === e.target.id);
  if (key) {
    key.rotation = (e.beforeRotate + e.rotate) % 360;
  }
};

const onRotateGroup = (e: any) => {
  e.events.forEach((ev: any) => {
    const key = keys.value.find((key) => key.id === ev.target.id);
    if (key) {
      key.rotation = (ev.beforeRotate + ev.rotate) % 360;
    }
  });
};

const onSelectEnd = (e: any) => {
  if (e.isDragStartEnd) {
    e.inputEvent.preventDefault();
    moveableRef.value.waitToChangeTarget().then(() => {
      moveableRef.value.dragStart(e.inputEvent);
    });
  }

  const selected: HTMLDivElement[] = e.selected;
  const selectedKeys = keys.value.filter((key) =>
    selected.some((el) => el.id === key.id)
  );

  activeKeyIndexes.value = selectedKeys.map((key) => keys.value.indexOf(key));
};

const onChangeInput = (keyData: KeyboardKeyData) => {
  console.log("onChangeInput", keyData);
  store.updateKey(keyData);
};

const onKeyDown = (e: KeyboardEvent) => {
  e.preventDefault();
  console.log("onKeyDown", e.key);

  // delete key
  if (e.key === "Delete" || e.key === "Backspace") {
    store.removeKeys(activeKeyIndexes.value);
    activeKeyIndexes.value = [];
  }
};

watch(keysCount, () => {
  window.ipc.send(
    "layout:save",
    store.state.layouts[store.state.activeLayoutIndex]
  );
  nextTick(() => {
    moveableRef.value.updateSelectors();
    moveableRef.value.updateRect();
  });
});

// watch(keys, () => {
//   window.ipc.send("layout:save", store.state.layouts);
// });

onMounted(async () => {
  document.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <ConfigLayout>
    <div class="preview" ref="previewRef" v-if="layout">
      <div class="layout-ui">
        <Icon class="icon" icon="mingcute:keyboard-fill" />
        <span class="label">{{ store.currentLayout.name }}</span>
      </div>
      <div id="layout-area" class="container">
        <KeyboardButton
          v-for="key in keys"
          class="keyboard-key configurable-key"
          :id="key.id"
          :key-data="key"
          :is-down="false"
        />
        <Moveable
          ref="moveableRef"
          :target="keyIdSelectors"
          :draggable="true"
          :scalable="false"
          :rotatable="true"
          :roundable="false"
          :snappable="true"
          :origin="false"
          :element-guidelines="keyIdSelectors"
          :stop-propagation="true"
          :throttle-rotate="1"
          :throttle-drag="1"
          @click-group="onClickGroup"
          @drag="onDrag"
          @drag-group="onDragGroup"
          @drag-start="onDragStart"
          @drag-end="onDragEnd"
          @rotate="onRotate"
          @rotate-group="onRotateGroup"
        />
        <Selecto
          ref="selectoRef"
          :container="previewRef"
          :drag-container="previewRef"
          :selectable-targets="['#layout-area .configurable-key']"
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
        activeKeyIndexes.length > 0 ? keys[activeKeyIndexes[0]] : undefined
      "
      @change="onChangeInput"
      @keydown.stop
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
.layout-ui {
  position: absolute;
  top: 16px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(4px 2px 0 #77777777);
  .icon {
    color: #d7ba8f;
    margin-right: 8px;
    width: 20px;
    height: 20px;
  }
  .label {
    font-weight: bold;
    font-size: 20px;
    color: #d7ba8f;
  }
}
</style>
