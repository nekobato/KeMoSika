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
const canvasPadding = 2400;
const panThreshold = 4;

type CanvasPanState = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
  hasMoved: boolean;
};

const canvasPanState = ref<CanvasPanState | null>(null);
const shouldSuppressGroundClick = ref(false);
const isCanvasPanning = computed(() => Boolean(canvasPanState.value));

const layout = computed<LayoutData | undefined>(() =>
  store.$state.layouts.find((layout) => layout.id === route.params.layoutId)
);
const items = computed(() => (layout.value ? layout.value.keys : []));
const itemsCount = computed(() => (items.value ? items.value.length : 0));
const itemIdSelectors = computed(() =>
  activeKeyIndexes.value
    .map((index) => items.value?.[index])
    .filter((item): item is LayoutItemData => Boolean(item))
    .map((item) => `#${item.id}`)
);

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

const canvasStyle = computed(() => {
  return {
    width: `${(layout.value?.width ?? 0) + canvasPadding * 2}px`,
    height: `${(layout.value?.height ?? 0) + canvasPadding * 2}px`
  };
});

const layoutPlacementStyle = computed(() => {
  return {
    left: `${canvasPadding}px`,
    top: `${canvasPadding}px`
  };
});

const addPicture = () => {};

const isConnectedTarget = (target?: Element | null): target is Element =>
  Boolean(target && target.isConnected);

/**
 * Scrolls the edit viewport so that the layout center starts at viewport center.
 */
const centerPreview = () => {
  const preview = previewRef.value;
  const layoutEl = document.getElementById("layout-area");

  if (!preview || !layoutEl) return;

  const scrollX =
    layoutEl.offsetLeft + layoutEl.offsetWidth / 2 - preview.clientWidth / 2;
  const scrollY =
    layoutEl.offsetTop + layoutEl.offsetHeight / 2 - preview.clientHeight / 2;

  preview.scrollLeft = Math.max(0, scrollX);
  preview.scrollTop = Math.max(0, scrollY);
};

/**
 * Clears the current item selection and refreshes Moveable/Selecto frames.
 */
const clearSelection = () => {
  activeKeyIndexes.value = [];
  updateSelectionFrame();
};

/**
 * Returns whether a pointer target belongs to item editing controls.
 */
const isEditorControlTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest(
      ".configurable, [class*='moveable'], [class*='selecto'], button, input, textarea, select, a"
    )
  );
};

/**
 * Stops the active canvas pan operation and releases pointer listeners.
 */
const stopCanvasPan = (event?: PointerEvent) => {
  const preview = previewRef.value;
  const state = canvasPanState.value;

  if (preview) {
    preview.removeEventListener("pointermove", onCanvasPointerMove);
    preview.removeEventListener("pointerup", onCanvasPointerUp);
    preview.removeEventListener("pointercancel", onCanvasPointerCancel);

    if (state && preview.hasPointerCapture(state.pointerId)) {
      preview.releasePointerCapture(state.pointerId);
    }
  }

  if (event && state && !state.hasMoved) {
    clearSelection();
  }

  if (state?.hasMoved) {
    shouldSuppressGroundClick.value = true;
  }

  canvasPanState.value = null;
};

/**
 * Starts panning the large edit canvas from an empty canvas/background area.
 */
const onCanvasPointerDown = (event: PointerEvent) => {
  const preview = previewRef.value;
  if (!preview || event.button !== 0 || !event.isPrimary) return;
  if (isEditorControlTarget(event.target)) return;

  event.preventDefault();
  event.stopPropagation();

  canvasPanState.value = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: preview.scrollLeft,
    scrollTop: preview.scrollTop,
    hasMoved: false
  };

  preview.setPointerCapture(event.pointerId);
  preview.addEventListener("pointermove", onCanvasPointerMove);
  preview.addEventListener("pointerup", onCanvasPointerUp);
  preview.addEventListener("pointercancel", onCanvasPointerCancel);
};

/**
 * Applies scroll deltas while the user drags the canvas.
 */
const onCanvasPointerMove = (event: PointerEvent) => {
  const preview = previewRef.value;
  const state = canvasPanState.value;
  if (!preview || !state || state.pointerId !== event.pointerId) return;

  const deltaX = event.clientX - state.startX;
  const deltaY = event.clientY - state.startY;
  if (
    !state.hasMoved &&
    Math.hypot(deltaX, deltaY) >= panThreshold
  ) {
    state.hasMoved = true;
  }

  preview.scrollLeft = state.scrollLeft - deltaX;
  preview.scrollTop = state.scrollTop - deltaY;
};

/**
 * Ends canvas panning after pointer release.
 */
const onCanvasPointerUp = (event: PointerEvent) => {
  stopCanvasPan(event);
};

/**
 * Cancels canvas panning if the pointer stream is interrupted.
 */
const onCanvasPointerCancel = () => {
  stopCanvasPan();
};

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
  if (shouldSuppressGroundClick.value) {
    shouldSuppressGroundClick.value = false;
    return;
  }

  if (
    e.target === previewRef.value ||
    (e.target instanceof HTMLElement &&
      (e.target.classList.contains("editor-canvas") ||
        e.target.id === "layout-area"))
  ) {
    clearSelection();
  }
};

const onDrag = (e: OnDrag) => {
  if (!isConnectedTarget(e.target)) return;
  const item = items.value?.find((item) => item.id === e.target.id);
  if (item) {
    item.x = e.left;
    item.y = e.top;
  }
};

const onDragStart = (e: OnDragStart) => {
  if (!isConnectedTarget(e.target)) return;
  const item = items.value?.find((item) => item.id === e.target.id);
  if (item) {
    // item.isModifying = true;
  }
};

const onDragEnd = (e: OnDragEnd) => {
  if (!isConnectedTarget(e.target)) return;
  const item = items.value?.find((item) => item.id === e.target.id);

  if (item && layout.value) {
    store.updateItem(layout.value.id, item);
  }
};

const onDragGroup = (e: OnDragGroup) => {
  e.events.forEach((ev: any) => {
    if (!isConnectedTarget(ev.target)) return;
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
  if (!isConnectedTarget(e.target)) return;
  e.inputEvent.preventDefault();
  setRotation(e.target.id, e.rotation);
};

const onRotateGroup = (e: OnRotateGroup) => {
  e.events.forEach((ev) => {
    setRotation(ev.target.id, ev.rotation);
  });
};

const onRotateEnd = async (e: OnRotateEnd) => {
  if (!isConnectedTarget(e.target)) return;
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

/**
 * Deletes the current layout after user confirmation and returns to the list.
 */
const onDeleteLayout = async () => {
  if (!layout.value) return;
  const layoutIndex = store.$state.layouts.findIndex(
    (item) => item.id === layout.value?.id
  );
  if (layoutIndex < 0) return;
  const layoutName = layout.value.name?.trim() || "このレイアウト";
  const confirmed = window.confirm(`「${layoutName}」を削除しますか？`);
  if (!confirmed) return;
  await store.deleteLayout(layoutIndex);
  await router.replace({ name: "Index" });
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
    activeKeyIndexes
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
  const item = items.value?.find((item) => item.id === itemId);
  if (item) {
    if (item.type === "key") {
      const keyItem = item as KeyboardKeyData;
      if (type === "keyDefault" || type === "keyActive") {
        keyItem.images[type] = imageId;
      }
    } else if (item.type === "mouse") {
      const mouseItem = item as MouseData;
      if (!mouseItem.ring) {
        mouseItem.ring = {
          size: Math.max(mouseItem.width, mouseItem.height),
          color: "#ffffff",
          images: {
            ring: "",
            pointer: ""
          }
        };
      }
      if (!mouseItem.buttonOverlays) {
        mouseItem.buttonOverlays = {
          left: { default: "", active: "" },
          right: { default: "", active: "" },
          middle: { default: "", active: "" }
        };
      }
      if (
        type === "mouseDefault" ||
        type === "mouseLeftClick" ||
        type === "mouseMiddleClick" ||
        type === "mouseRightClick" ||
        type === "mouseScrollUp" ||
        type === "mouseScrollDown"
      ) {
        mouseItem.images[type] = imageId;
      } else if (type === "ring") {
        mouseItem.ring.images.ring = imageId;
      } else if (type === "pointer") {
        mouseItem.ring.images.pointer = imageId;
      } else if (type === "leftDefault") {
        mouseItem.buttonOverlays.left.default = imageId;
      } else if (type === "leftActive") {
        mouseItem.buttonOverlays.left.active = imageId;
      } else if (type === "rightDefault") {
        mouseItem.buttonOverlays.right.default = imageId;
      } else if (type === "rightActive") {
        mouseItem.buttonOverlays.right.active = imageId;
      } else if (type === "middleDefault") {
        mouseItem.buttonOverlays.middle.default = imageId;
      } else if (type === "middleActive") {
        mouseItem.buttonOverlays.middle.active = imageId;
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
    const buffer = await file.arrayBuffer();
    await window.kemosikaApi.saveImageBuffer({ buffer });
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

  await nextTick();
  centerPreview();
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
  stopCanvasPan();
});
</script>

<template>
  <ConfigLayout>
    <template #header>
      <Header />
    </template>
    <template #main>
      <main @click="onClickGround">
        <div
          class="preview"
          :class="{ 'is-panning': isCanvasPanning }"
          ref="previewRef"
          v-if="layout"
          @pointerdown.capture="onCanvasPointerDown"
        >
          <div
            class="editor-canvas kmsk-dotted-background"
            :style="canvasStyle"
          >
            <div
              id="layout-area"
              data-testid="layout-edit-area"
              class="container"
              :style="[layoutStyle, layoutPlacementStyle]"
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
        </div>
      </main>
      <FloatActions>
        <ButtonGroup>
          <Button
            class="float-action-button"
            data-testid="edit-add-key-button"
            @click="addKey"
            aria-label="Add Key"
          >
            <Icon icon="mingcute:hotkey-line" class="action-icon" />
            <span class="action-label">キー追加</span>
          </Button>
          <Button
            class="float-action-button"
            data-testid="edit-add-mouse-button"
            @click="addMouse"
            aria-label="Add Mouse"
          >
            <Icon icon="mingcute:mouse-line" class="action-icon" />
            <span class="action-label">マウス追加</span>
          </Button>
          <Button
            class="float-action-button"
            data-testid="edit-add-picture-button"
            @click="addPicture"
            aria-label="Add Image"
          >
            <Icon icon="mingcute:pic-line" class="action-icon" />
            <span class="action-label">画像追加</span>
          </Button>
        </ButtonGroup>
      </FloatActions>
    </template>
    <template #aside>
      <aside class="edit-aside">
        <div class="aside-content">
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
        </div>
        <div
          class="aside-footer"
          v-if="layout && activeKeyIndexes.length === 0"
        >
          <Button
            class="layout-delete-button"
            severity="danger"
            size="small"
            @click="onDeleteLayout"
            aria-label="Delete Layout"
          >
            <Icon icon="mingcute:delete-2-line" class="layout-delete-icon" />
            <span>レイアウト削除</span>
          </Button>
        </div>
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
        style="width: calc(100% - 48px)"
      >
        <template #closeicon="{ class: iconClass }">
          <Icon :class="iconClass" icon="mingcute:close-line" />
        </template>
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
            >
              <template #chooseicon>
                <Icon
                  icon="mingcute:upload-line"
                  class="p-button-icon p-button-icon-left"
                />
              </template>
            </FileUpload>
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
  height: 100%;
}
.preview {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--color-grey-100);
  overflow: scroll;
  cursor: grab;
  overscroll-behavior: contain;

  &.is-panning {
    cursor: grabbing;
    user-select: none;
  }
}
.editor-canvas {
  position: relative;
  min-width: 100%;
  min-height: 100%;
}
.edit-aside {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
}
.aside-content {
  flex: 1 1 auto;
  width: 100%;
}
.aside-footer {
  margin-top: auto;
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}
.layout-delete-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.layout-delete-icon {
  font-size: 1rem;
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
  position: absolute;
}
.configurable {
  cursor: grab;
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
