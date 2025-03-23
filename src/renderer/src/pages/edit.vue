<script setup lang="ts">
import {
  KeyboardKeyData,
  LayoutData,
  LayoutItemData,
  MouseData
} from "@shared/types";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Moveable, {
  OnClickGroup,
  OnDrag,
  OnDragEnd,
  OnDragGroup,
  OnDragStart,
  OnRotate,
  OnRotateEnd,
  OnRotateGroup
} from "vue3-moveable";
import Selecto from "vue3-selecto";
import KeyboardButton from "../components/KeyboardButton.vue";
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import KeyboardKeyConfig from "../components/pages/config/KeyboardKeyConfig.vue";
import MouseConfig from "../components/pages/config/MouseConfig.vue";
import LayoutConfig from "../components/pages/config/LayoutConfig.vue";
import { useStore } from "../store";
import Header from "@/components/Header.vue";
import Mouse from "@/components/Mouse.vue";
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";
import FloatActions from "@/components/FloatActions/FloatActions.vue";
import FloatActionButton from "@/components/FloatActions/FloatActionButton.vue";
import { ElDialog } from "element-plus";
import ImageList from "@/components/pages/config/ImageList.vue";
import { InputImageType } from "@/types/app";
import { useEditLayout } from "@/composables/edit/useEditLayout";
import { useEditItemByKey } from "@/composables/edit/useEditItemByKey";
import router from "@/router";

const route = useRoute();
const store = useStore();
const { addKey, addMouse } = useEditLayout();
const { updateItemByKey } = useEditItemByKey();
const activeKeyIndexes = ref<number[]>([]);
const activeKeyImageType = ref<InputImageType>();
const previewRef = ref<HTMLDivElement>();
const moveableRef = ref<Moveable>();
const selectoRef = ref<Selecto>();
const showImageDialog = ref(false);

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

const addPicture = () => {};

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

const imageSelectTargetItem = computed(() => {
  if (selectedItemHead.value && activeKeyImageType.value) {
    return {
      item: selectedItemHead.value,
      type: activeKeyImageType.value
    };
  }
  return undefined;
});

const onClickGroup = (e: OnClickGroup) => {
  selectoRef.value?.clickTarget(e.inputEvent, e.inputTarget);
};

const onClickGround = (e: MouseEvent) => {
  if (e.target === previewRef.value) {
    activeKeyIndexes.value = [];
  }
};

const onDrag = (e: OnDrag) => {
  const item = items.value?.find((item) => item.id === e.target.id);
  if (item) {
    item.x = e.left;
    item.y = e.top;
  }
};

const onDragStart = (e: OnDragStart) => {
  const item = items.value?.find((item) => item.id === e.target.id);
  if (item) {
    // item.isModifying = true;
  }
};

const onDragEnd = (e: OnDragEnd) => {
  const item = items.value?.find((item) => item.id === e.target.id);

  if (item && layout.value) {
    store.updateItem(layout.value.id, item);
  }
};

const onDragGroup = (e: OnDragGroup) => {
  e.events.forEach((ev: any) => {
    const item = items.value?.find((item) => item.id === ev.target.id);
    if (item) {
      item.x = ev.left;
      item.y = ev.top;
    }
  });
};

const onRotate = (e: OnRotate) => {
  e.inputEvent.preventDefault();
  if (
    store.$state.layouts[store.activeLayoutIndex].keys[
      activeKeyIndexes.value[0]
    ].rotation
  ) {
    store.$state.layouts[store.activeLayoutIndex].keys[
      activeKeyIndexes.value[0]
    ].rotation = e.rotation;
  }
};

const onRotateGroup = (e: OnRotateGroup) => {
  console.log("onRotate", e);
};

const onRotateEnd = (e: OnRotateEnd) => {
  console.log("onRotateEnd", e);
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
  if (layout.value) {
    store.updateItem(layout.value.id, keyData);
  }
};

const onChangeLayout = (layout: LayoutData) => {
  store.updateLayout(layout);
};

const onKeyDown = (e: KeyboardEvent) => {
  e.preventDefault();
  const { shouldUpdateRect } = updateItemByKey(
    {
      key: e.key,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      metaKey: e.metaKey
    },
    activeKeyIndexes.value
  );

  if (shouldUpdateRect) {
    nextTick(() => {
      moveableRef.value?.updateRect();
    });
  }
};

const openImageDialog = (type: InputImageType) => {
  showImageDialog.value = true;
  activeKeyImageType.value = type;
};

const onSelectImage = async ({
  itemId,
  type,
  imageId
}: {
  itemId: string;
  type: InputImageType;
  imageId: string;
}) => {
  console.log(itemId, type, imageId);
  const item = items.value?.find((item) => item.id === itemId);
  if (item) {
    if (item.type === "key") {
      const keyItem = item as KeyboardKeyData;
      if (type === "keyDefault" || type === "keyActive") {
        keyItem.images[type] = imageId;
      }
    } else if (item.type === "mouse") {
      const mouseItem = item as MouseData;
      if (type !== "keyDefault" && type !== "keyActive") {
        mouseItem.images[type as keyof typeof mouseItem.images] = imageId;
      }
    }
    await store.updateItem(layout.value?.id || "", item);
  }
  showImageDialog.value = false;
};

const onUpdateImages = async () => {
  await store.getImages();
};

watch(itemsCount, async () => {
  nextTick(() => {
    moveableRef.value?.updateSelectors();
    moveableRef.value?.updateRect();
  });
});

onMounted(async () => {
  document.addEventListener("keydown", onKeyDown);

  if (route.params.layoutId) {
    const activeLayoutIndex = store.$state.layouts.findIndex(
      (layout) => layout.id === route.params.layoutId
    );

    if (activeLayoutIndex === -1) {
      router.replace({ name: "home" });
      return;
    }

    store.changeActiveLayout(activeLayoutIndex);
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <ConfigLayout>
    <template #header>
      <Header />
    </template>
    <template #main>
      <main @click="onClickGround">
        <div class="preview" ref="previewRef" v-if="layout">
          <div
            id="layout-area"
            class="container kmsk-dotted-background"
            :style="layoutStyle"
            @click="onClickGround"
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
        </div>
      </main>
      <FloatActions class="float-tool-actions">
        <FloatActionButton @click="addKey">
          <template #icon>
            <Icon icon="mingcute:add-fill" class="add-icon" />
            <Icon icon="mingcute:hotkey-line" class="nn-icon size-small" />
          </template>
        </FloatActionButton>
        <FloatActionButton @click="addMouse">
          <template #icon>
            <Icon icon="mingcute:add-fill" class="add-icon" />
            <Icon icon="mingcute:mouse-line" class="nn-icon size-small" />
          </template>
        </FloatActionButton>
        <FloatActionButton @click="addPicture">
          <template #icon>
            <Icon icon="mingcute:pic-line" class="nn-icon size-small" />
          </template>
        </FloatActionButton>
      </FloatActions>
    </template>
    <template #aside>
      <aside>
        <KeyboardKeyConfig
          v-if="selectedKeyHead"
          :keyData="selectedKeyHead"
          @change="onChangeInput"
          @keydown.stop
          @open-image-dialog="openImageDialog"
        />
        <MouseConfig
          v-if="selectedMouseHead"
          :mouseData="selectedMouseHead"
          @change="onChangeInput"
          @keydown.stop
          @open-image-dialog="openImageDialog"
        />
        <LayoutConfig
          v-if="activeKeyIndexes.length === 0"
          :layout="layout"
          @change="onChangeLayout"
          @keydown.stop
        />
      </aside>
    </template>
    <template #dialog>
      <ElDialog
        width="calc(100% - 48px)"
        v-model="showImageDialog"
        title="Select Image"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <ImageList
          @select="onSelectImage"
          @update="onUpdateImages"
          :item="imageSelectTargetItem?.item"
          :type="imageSelectTargetItem?.type"
          :images="store.$state.images"
        />
      </ElDialog>
    </template>
  </ConfigLayout>
</template>

<style scoped lang="scss">
main {
  width: 100%;
}
.preview {
  position: relative;
  min-width: 100%;
  min-height: 100%;
  padding: 80px;
  background-color: var(--color-grey-100);
  overflow: scroll;
}
.layout-area {
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
.layout-selector {
  position: absolute;
  top: 16px;
  left: 16px;
}
.float-tool-actions {
  .add-icon {
    position: absolute;
    top: 4px;
    left: 8px;
    flex: 0 0 16px;
    color: var(--color-grey-200);
    width: 10px;
    height: 10px;
  }
}
</style>
