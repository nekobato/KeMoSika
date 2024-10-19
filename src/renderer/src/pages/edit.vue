<script setup lang="ts">
import {
  KeyboardKeyData,
  LayoutData,
  LayoutItemData,
  MouseData
} from "@shared/types";
import { nanoid } from "nanoid/non-secure";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Moveable from "vue3-moveable";
import Selecto from "vue3-selecto";
import KeyboardButton from "../components/KeyboardButton.vue";
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import KeyboardKeyConfig from "../components/pages/config/KeyboardKeyConfig.vue";
import MouseConfig from "../components/pages/config/MouseConfig.vue";
import LayoutConfig from "../components/pages/config/LayoutConfig.vue";
import { useStore } from "../store";
import NNButton from "@/components/common/NNButton.vue";
import Header from "@/components/Header.vue";
import Mouse from "@/components/Mouse.vue";
import { Icon } from "@iconify/vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const store = useStore();
const activeKeyIndexes = ref<number[]>([]);
const previewRef = ref<HTMLDivElement>();
const moveableRef = ref<Moveable>();
const selectoRef = ref<Selecto>();

const tool = ref("move");

const layout = computed<LayoutData | undefined>(() =>
  store.$state.layouts.find((layout) => layout.id === route.params.layoutId)
);
const items = computed(() => (layout.value ? layout.value.keys : []));
const itemsCount = computed(() => (items.value ? items.value.length : 0));
const itemIdSelectors = computed(() => {
  return activeKeyIndexes.value.map((index) =>
    items.value ? `#${items.value[index].id}` : ""
  );
});

const keys = computed<KeyboardKeyData[]>(() =>
  items.value.filter((key) => key.type === "key")
);
const mouses = computed(() => {
  return items.value.filter((key) => key.type === "mouse");
});

const layoutStyle = computed(() => {
  return {
    width: `${layout.value?.width}px`,
    height: `${layout.value?.height}px`
  };
});

const addKey = () => {
  store.addItem({
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
  store.addItem({
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

const selectedItemHead = computed(() =>
  items.value?.length ? items.value[activeKeyIndexes.value[0]] : undefined
);

const selectedKeyHead = computed(() => {
  return selectedItemHead.value?.type === "key"
    ? (selectedItemHead.value as KeyboardKeyData)
    : undefined;
});

const selectedMouseHead = computed(() => {
  return selectedItemHead.value?.type === "mouse"
    ? (selectedItemHead.value as MouseData)
    : undefined;
});

const onClickGroup = (e: any) => {
  selectoRef.value?.clickTarget(e.inputEvent, e.inputTarget);
};

const onDrag = (e: any) => {
  const item = items.value?.find((item) => item.id === e.target.id);
  if (item) {
    item.x = e.left;
    item.y = e.top;
  }
};

const onDragStart = (e: any) => {
  const item = items.value?.find((item) => item.id === e.target.id);
  if (item) {
    // item.isModifying = true;
  }
};

const onDragEnd = (e: any) => {
  const item = items.value?.find((item) => item.id === e.target.id);

  if (item) {
    store.updateItem(item);
  }
};

const onDragGroup = (e: any) => {
  e.events.forEach((ev: any) => {
    const item = items.value?.find((item) => item.id === ev.target.id);
    if (item) {
      item.x = ev.left;
      item.y = ev.top;
    }
  });
};

const onRotate = (e: any) => {
  e.inputEvent.preventDefault();
  const item = items.value?.find((item) => item.id === e.target.id);
  if (item) {
    item.rotation = (e.beforeRotate + e.rotate) % 360;
  }
};

const onRotateGroup = (e: any) => {
  e.events.forEach((ev: any) => {
    const item = items.value?.find((item) => item.id === ev.target.id);
    if (item) {
      // item.x = ev.left;
      // item.y = ev.top;
      item.rotation = (ev.beforeRotate + ev.rotate) % 360;
    }
  });
};

const onRotateEnd = (e: any) => {
  const item = items.value?.find((item) => item.id === e.target.id);
  if (item) {
    store.updateItem(item);
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
  const selectedItems = items.value?.filter((item) =>
    selected.some((el) => el.id === item.id)
  );

  if (selectedItems?.length) {
    activeKeyIndexes.value = selectedItems
      .map((item) => items.value?.indexOf(item))
      .filter((item) => item !== undefined);
  }
};

const onChangeInput = (keyData: LayoutItemData) => {
  store.updateItem(keyData);
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
      store.removeItems(activeKeyIndexes.value);
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
      items.value[index].y += move;
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
      items.value[index].x += move;
    });
    nextTick(() => {
      moveableRef.value?.updateRect();
    });
  }
};

const changeTool = (newTool: string) => {
  tool.value = newTool;
};

const gotoImageManager = () => {
  router.push("/image");
};

watch(itemsCount, async () => {
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
    <Header>
      <div class="tools">
        <button
          class="nn-button type-ghost"
          @click="changeTool('move')"
          :class="{ enabled: tool === 'move' }"
        >
          <Icon icon="mingcute:move-line" class="nn-icon size-xsmall" />
        </button>
        <button
          class="nn-button type-ghost"
          @click="changeTool('select')"
          :class="{ enabled: tool === 'select' }"
        >
          <Icon icon="mingcute:cursor-2-line" class="nn-icon size-xsmall" />
        </button>
        <button class="nn-button type-ghost" @click="gotoImageManager">
          <Icon icon="mingcute:pic-line" class="nn-icon size-xsmall" />
        </button>
      </div>
    </Header>
    <div class="preview" ref="previewRef" v-if="layout">
      <div
        id="layout-area"
        class="container kmsk-dotted-background"
        :class="tool"
        :style="layoutStyle"
      >
        <KeyboardButton
          class="configurable"
          v-for="key in keys"
          :key="key.id"
          :id="key.id"
          :key-data="key"
        />
        <Mouse
          class="configurable"
          v-for="mouse in mouses"
          :key="mouse.id"
          :id="mouse.id"
          :data="mouse"
        />
        <Moveable
          ref="moveableRef"
          :target="itemIdSelectors"
          :draggable="true"
          :scalable="false"
          :rotatable="true"
          :roundable="false"
          :snappable="true"
          :origin="false"
          :element-guidelines="itemIdSelectors"
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
      v-if="selectedKeyHead"
      :keyData="selectedKeyHead"
      @change="onChangeInput"
      @keydown.stop
    />
    <MouseConfig
      v-if="selectedMouseHead"
      :mouseData="selectedMouseHead"
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

  &.move {
    cursor: move;
  }

  &.select {
    cursor: default;
  }
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
.tools {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .nn-button {
    width: 40px;
    height: 24px;
    padding: 0;
    min-height: auto;
    -webkit-app-region: no-drag;

    &.enabled {
      background-color: #252525;
    }
  }
}
</style>
