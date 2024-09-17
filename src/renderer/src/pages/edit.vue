<script setup lang="ts">
import { KeyboardKeyData, LayoutData } from "@shared/types";
import { nanoid } from "nanoid/non-secure";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Moveable from "vue3-moveable";
import Selecto from "vue3-selecto";
import KeyboardButton from "../components/KeyboardButton.vue";
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import KeyboardKeyConfig from "../components/pages/config/KeyboardKeyConfig.vue";
import LayoutConfig from "../components/pages/config/LayoutConfig.vue";
import { useStore } from "../store";
import NNButton from "@/components/common/NNButton.vue";
import Header from "@/components/Header.vue";
import Mouse from "@/components/Mouse.vue";

const store = useStore();
const activeKeyIndexes = ref<number[]>([]);
const previewRef = ref<HTMLDivElement>();
const moveableRef = ref<Moveable>();
const selectoRef = ref<Selecto>();

const layout = computed(
  () => store.$state.layouts[store.$state.activeLayoutIndex]
);
const items = computed(
  () => store.$state.layouts[store.$state.activeLayoutIndex]?.keys
);
const keys = computed<KeyboardKeyData[]>(() =>
  store.$state.layouts[store.$state.activeLayoutIndex]?.keys.filter(
    (key) => key.type === "key"
  )
);
const mouses = computed(() => {
  return store.$state.layouts[store.$state.activeLayoutIndex]?.keys.filter(
    (key) => key.type === "mouse"
  );
});
const keysCount = computed(() => keys.value?.length);
const keyIdSelectors = computed(() => {
  return activeKeyIndexes.value.map((index) => `#${keys.value[index].id}`);
});

const layoutStyle = computed(() => {
  return {
    width: `${layout.value?.width}px`,
    height: `${layout.value?.height}px`
  };
});

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

const addMouse = () => {
  store.addKey({
    id: `mouse-${nanoid()}`,
    type: "mouse",
    x: 0,
    y: 0,
    width: 48,
    height: 48,
    rotation: 0,
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
  selectoRef.value?.clickTarget(e.inputEvent, e.inputTarget);
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
    store.updateKey(key);
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
      // key.x = ev.left;
      // key.y = ev.top;
      key.rotation = (ev.beforeRotate + ev.rotate) % 360;
    }
  });
};

const onRotateEnd = (e: any) => {
  console.log(e);
  const key = keys.value.find((key) => key.id === e.target.id);
  if (key) {
    store.updateKey(key);
  }
};

const onSelectEnd = (e: any) => {
  if (e.isDragStartEnd) {
    e.inputEvent.preventDefault();
    moveableRef.value?.waitToChangeTarget().then(() => {
      moveableRef.value?.dragStart(e.inputEvent);
    });
  }

  const selected: HTMLDivElement[] = e.selected;
  const selectedItems = items.value.filter((key) =>
    selected.some((el) => el.id === key.id)
  );

  activeKeyIndexes.value = selectedItems.map((key) => keys.value.indexOf(key));
};

const onChangeInput = (keyData: KeyboardKeyData) => {
  store.updateKey(keyData);
};

const onChangeLayout = (layout: LayoutData) => {
  console.log(layout);
  store.updateLayout(layout);
};

const onKeyDown = (e: KeyboardEvent) => {
  e.preventDefault();

  // delete key
  if (e.key === "Delete" || e.key === "Backspace") {
    if (activeKeyIndexes.value.length > 0) {
      store.removeKeys(activeKeyIndexes.value);
      activeKeyIndexes.value = [];
    }
  }

  // undo
  if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
    // [0] is empty initial state
    if (store.history && store.history.length > 2) {
      activeKeyIndexes.value = [];
      store.undo();
    }
  }

  // redo
  if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
    // [0] is empty initial state
    if (store.history && store.history.length > 2) {
      activeKeyIndexes.value = [];
      store.redo();
    }
  }

  // move
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    if (activeKeyIndexes.value.length === 0) {
      return;
    }
    let move = e.key === "ArrowUp" ? -1 : 1;
    move *= e.shiftKey ? 10 : 1;
    activeKeyIndexes.value.forEach((index) => {
      keys.value[index].y += move;
    });
    nextTick(() => {
      moveableRef.value?.updateRect();
    });
  }

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    if (activeKeyIndexes.value.length === 0) {
      return;
    }
    let move = e.key === "ArrowLeft" ? -1 : 1;
    move *= e.shiftKey ? 10 : 1;
    activeKeyIndexes.value.forEach((index) => {
      keys.value[index].x += move;
    });
    nextTick(() => {
      moveableRef.value?.updateRect();
    });
  }
};

watch(keysCount, async () => {
  nextTick(() => {
    moveableRef.value?.updateSelectors();
    moveableRef.value?.updateRect();
  });
});

onMounted(async () => {
  document.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <ConfigLayout>
    <Header />
    <div class="preview" ref="previewRef" v-if="layout">
      <div
        id="layout-area"
        class="container kmsk-dotted-background"
        :style="layoutStyle"
      >
        <KeyboardButton
          v-for="key in keys"
          class="keyboard-key configurable"
          :id="key.id"
          :key-data="key"
          :is-down="false"
        />
        <Mouse
          class="mouse configurable"
          v-for="mouse in mouses"
          :data="mouse"
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
          @rotate-end="onRotateEnd"
        />
        <Selecto
          ref="selectoRef"
          :container="previewRef"
          :drag-container="previewRef"
          :selectable-targets="['#layout-area .configurable']"
          :selectBy-click="true"
          :select-from-inside="false"
          :continue-select="false"
          :toggle-continue-select="['shift']"
          @select-end="onSelectEnd"
        />
      </div>
      <NNButton @click="addKey" class="button type-addkey">ADD KEY</NNButton>
      <NNButton @click="addMouse" class="button type-addmouse"
        >ADD MOUSE</NNButton
      >
    </div>
    <KeyboardKeyConfig
      v-if="activeKeyIndexes.length > 0"
      :keyData="keys[activeKeyIndexes[0]]"
      @change="onChangeInput"
      @keydown.stop
    />
    <LayoutConfig
      v-if="activeKeyIndexes.length === 0"
      :layout="layout"
      @change="onChangeLayout"
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
  min-width: 100%;
  min-height: 100%;
  overflow: scroll;
  padding: 80px;
  padding-right: calc(80px + 320px);
  background-color: #e5e5e5;
}

.button {
  position: fixed;
  width: 160px;

  &.type-back {
    top: 16px;
    left: 16px;
    width: 40px;
  }

  &.type-addkey {
    bottom: 16px;
    left: 16px;
  }
  &.type-addmouse {
    bottom: 16px;
    left: 180px;
  }
}

.container {
  position: relative;
}
.configurable {
  cursor: grab;

  &.modifying {
    cursor: grabbing;
  }
}
.layout-selector {
  position: absolute;
  top: 16px;
  left: 16px;
}
</style>
