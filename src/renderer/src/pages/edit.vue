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
  OnRotateGroup,
  OnRotateGroupEnd
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
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import ButtonGroup from "primevue/buttongroup";
import FileUpload, { FileUploadUploaderEvent } from "primevue/fileupload";
import FloatActions from "@/components/FloatActions/FloatActions.vue";
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

const updateSelectionFrame = () => {
  nextTick(() => {
    const targets = activeKeyIndexes.value
      .map((index) => items.value?.[index])
      .filter((item): item is LayoutItemData => Boolean(item))
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    moveableRef.value?.updateSelectors();
    moveableRef.value?.updateRect();
    selectoRef.value?.setSelectedTargets(targets);
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
    updateSelectionFrame();
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

const setRotation = (targetId: string, rotation: number) => {
  const target = items.value?.find((item) => item.id === targetId);
  if (target) {
    target.rotation = rotation;
  }
};

const persistRotation = async (targetIds: string[]) => {
  if (!layout.value) return;
  const layoutId = layout.value.id;
  const uniqueIds = Array.from(new Set(targetIds));
  await Promise.all(
    uniqueIds.map(async (id) => {
      const target = items.value?.find((item) => item.id === id);
      if (target) {
        await store.updateItem(layoutId, { ...target });
      }
    })
  );
};

const onRotate = (e: OnRotate) => {
  e.inputEvent.preventDefault();
  setRotation(e.target.id, e.rotation);
};

const onRotateGroup = (e: OnRotateGroup) => {
  e.events.forEach((ev) => {
    setRotation(ev.target.id, ev.rotation);
  });
};

const onRotateEnd = async (e: OnRotateEnd) => {
  await persistRotation([e.target.id]);
};

const onRotateGroupEnd = async (e: OnRotateGroupEnd) => {
  const ids = e.events.map((ev) => ev.target.id);
  await persistRotation(ids);
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
    updateSelectionFrame();
  }
};

const onChangeInput = (keyData: LayoutItemData) => {
  if (layout.value) {
    store.updateItem(layout.value.id, keyData);
    updateSelectionFrame();
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
      metaKey: e.metaKey
    },
    activeKeyIndexes.value
  );

  if (shouldUpdateRect) {
    updateSelectionFrame();
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

const uploadImages = async (event: FileUploadUploaderEvent) => {
  const files = event.files
    ? Array.isArray(event.files)
      ? event.files
      : [event.files]
    : [];

  for (const file of files) {
    const fileWithPath = file as File & { path?: string };

    if (fileWithPath.path) {
      await window.ipc.invoke("image:save", { imagePath: fileWithPath.path });
      continue;
    }

    const buffer = await file.arrayBuffer();
    await window.ipc.invoke("image:save-buffer", { buffer });
  }

  await onUpdateImages();
};

watch(itemsCount, async () => {
  updateSelectionFrame();
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
              @rotate-group-end="onRotateGroupEnd"
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
        <ButtonGroup>
          <Button
            class="float-action-button"
            @click="addKey"
            aria-label="Add Key"
          >
            <Icon icon="mingcute:add-fill" class="action-icon add-icon" />
            <Icon icon="mingcute:hotkey-line" class="action-icon size-small" />
          </Button>
          <Button
            class="float-action-button"
            @click="addMouse"
            aria-label="Add Mouse"
          >
            <Icon icon="mingcute:add-fill" class="action-icon add-icon" />
            <Icon icon="mingcute:mouse-line" class="action-icon size-small" />
          </Button>
          <Button
            class="float-action-button"
            @click="addPicture"
            aria-label="Add Image"
          >
            <Icon icon="mingcute:pic-line" class="action-icon size-small" />
          </Button>
        </ButtonGroup>
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
      <Dialog
        v-model:visible="showImageDialog"
        modal
        :closable="true"
        :draggable="false"
        :baseZIndex="5000"
        appendTo="body"
        style="width: calc(100% - 48px);"
      >
        <template #header>
          <div class="image-dialog-header">
            <span class="image-dialog-title">Select Image</span>
            <FileUpload
              class="image-dialog-upload"
              mode="basic"
              chooseLabel="Upload"
              accept="image/*"
              :auto="true"
              customUpload
              @uploader="uploadImages"
            />
          </div>
        </template>
        <ImageList
          @select="onSelectImage"
          @update="onUpdateImages"
          :item="imageSelectTargetItem?.item"
          :type="imageSelectTargetItem?.type"
          :images="store.$state.images"
        />
      </Dialog>
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

.image-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.image-dialog-title {
  font-size: 1rem;
  font-weight: 600;
}

.image-dialog-upload :deep(.p-button) {
  padding: 0.4rem 0.75rem;
}
</style>
