<script setup lang="ts">
import type { LayoutItemData } from "@shared/types";
import { Icon } from "@iconify/vue";
import { computed, ref } from "vue";
import {
  getLayerItemLabel,
  getLayerItems,
  moveLayerItems,
  type LayerDropPosition,
  type LayerSelectionRequest,
} from "@/utils/layerOrder";

const { items, selectedItemIds, hiddenItemIds } = defineProps<{
  items: LayoutItemData[];
  selectedItemIds: string[];
  hiddenItemIds: string[];
}>();

const emit = defineEmits<{
  reorder: [orderedItemIds: string[]];
  select: [request: LayerSelectionRequest];
  toggleVisibility: [itemId: string];
}>();

const draggingItemIds = ref<string[]>([]);
const dropTargetId = ref<string>();
const dropPosition = ref<LayerDropPosition>();

const layerItems = computed(() => getLayerItems(items));
const selectedItemIdSet = computed(() => new Set(selectedItemIds));
const hiddenItemIdSet = computed(() => new Set(hiddenItemIds));
const draggingItemIdSet = computed(() => new Set(draggingItemIds.value));

const getItemIcon = (item: LayoutItemData): string =>
  item.type === "mouse" ? "mingcute:mouse-line" : "mingcute:hotkey-line";

const clearDragState = (): void => {
  draggingItemIds.value = [];
  dropTargetId.value = undefined;
  dropPosition.value = undefined;
};

const onSelect = (itemId: string, event: MouseEvent): void => {
  emit("select", {
    itemId,
    additive: event.metaKey || event.ctrlKey,
    range: event.shiftKey,
  });
};

const onDragStart = (event: DragEvent, itemId: string): void => {
  const isSelected = selectedItemIdSet.value.has(itemId);
  draggingItemIds.value = isSelected ? [...selectedItemIds] : [itemId];

  if (!isSelected) {
    emit("select", { itemId, additive: false, range: false });
  }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);
  }
};

const onDragOver = (event: DragEvent, itemId: string): void => {
  if (
    draggingItemIds.value.length === 0 ||
    draggingItemIdSet.value.has(itemId)
  ) {
    return;
  }

  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;

  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";

  const bounds = target.getBoundingClientRect();
  dropTargetId.value = itemId;
  dropPosition.value =
    event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
};

const onDrop = (event: DragEvent, itemId: string): void => {
  if (
    draggingItemIds.value.length === 0 ||
    draggingItemIdSet.value.has(itemId) ||
    dropTargetId.value !== itemId ||
    !dropPosition.value
  ) {
    clearDragState();
    return;
  }

  event.preventDefault();
  const reorderedItems = moveLayerItems(
    items,
    draggingItemIds.value,
    itemId,
    dropPosition.value,
  );
  const didOrderChange = reorderedItems.some(
    (item, index) => item.id !== items[index]?.id,
  );

  if (didOrderChange) {
    emit(
      "reorder",
      reorderedItems.map((item) => item.id),
    );
  }

  clearDragState();
};
</script>

<template>
  <div class="layer-panel" data-testid="layer-panel">
    <ul v-if="layerItems.length" class="layer-list" role="list">
      <li
        v-for="item in layerItems"
        :key="item.id"
        class="layer-item"
        :data-item-id="item.id"
        :class="{
          'is-selected': selectedItemIdSet.has(item.id),
          'is-hidden': hiddenItemIdSet.has(item.id),
          'is-dragging': draggingItemIdSet.has(item.id),
          'is-drop-before':
            dropTargetId === item.id && dropPosition === 'before',
          'is-drop-after':
            dropTargetId === item.id && dropPosition === 'after',
        }"
        draggable="true"
        @dragstart="onDragStart($event, item.id)"
        @dragover="onDragOver($event, item.id)"
        @drop="onDrop($event, item.id)"
        @dragend="clearDragState"
      >
        <span class="drag-handle" aria-hidden="true">
          <Icon icon="mingcute:dots-line" />
        </span>
        <button
          class="layer-select"
          type="button"
          :aria-pressed="selectedItemIdSet.has(item.id)"
          @click="onSelect(item.id, $event)"
        >
          <Icon :icon="getItemIcon(item)" class="item-icon" aria-hidden="true" />
          <span class="item-copy">
            <span class="item-label">{{ getLayerItemLabel(item) }}</span>
            <span class="item-meta">{{ item.width }} × {{ item.height }}</span>
          </span>
        </button>
        <button
          class="visibility-button"
          type="button"
          :aria-label="
            hiddenItemIdSet.has(item.id)
              ? `${getLayerItemLabel(item)}を編集画面に表示`
              : `${getLayerItemLabel(item)}を編集画面で非表示`
          "
          :aria-pressed="!hiddenItemIdSet.has(item.id)"
          @click.stop="emit('toggleVisibility', item.id)"
          @dragstart.prevent.stop
        >
          <Icon
            :icon="
              hiddenItemIdSet.has(item.id)
                ? 'mingcute:eye-close-line'
                : 'mingcute:eye-2-line'
            "
            aria-hidden="true"
          />
        </button>
      </li>
    </ul>
    <p v-else class="empty-state">レイヤーはありません</p>
  </div>
</template>

<style scoped lang="scss">
.layer-panel {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  color: #eef1f3;
  background: #242629;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 8px;
  list-style: none;
}

.layer-item {
  position: relative;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 36px;
  align-items: center;
  min-height: 52px;
  overflow: visible;
  color: #dce2e6;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: grab;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.055);
    border-color: rgba(255, 255, 255, 0.14);
  }

  &.is-selected {
    color: #f5fbfc;
    background: rgba(103, 199, 217, 0.12);
    border-color: rgba(103, 199, 217, 0.42);
    box-shadow: inset 3px 0 #67c7d9;
  }

  &.is-hidden .layer-select {
    opacity: 0.5;
  }

  &.is-dragging {
    opacity: 0.38;
  }

  &.is-drop-before::before,
  &.is-drop-after::after {
    position: absolute;
    right: 0;
    left: 0;
    z-index: 1;
    height: 2px;
    content: "";
    background: #67c7d9;
    border-radius: 999px;
    box-shadow: 0 0 0 1px rgba(25, 25, 25, 0.8);
  }

  &.is-drop-before::before {
    top: -3px;
  }

  &.is-drop-after::after {
    bottom: -3px;
  }

  &:active {
    cursor: grabbing;
  }
}

.drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #879098;
  font-size: 18px;
}

.layer-select,
.visibility-button {
  color: inherit;
  background: transparent;
  border: 0;

  &:focus-visible {
    outline: 2px solid #67c7d9;
    outline-offset: -2px;
  }
}

.layer-select {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  height: 100%;
  padding: 6px 4px;
  text-align: left;
}

.item-icon {
  flex: 0 0 auto;
  color: #bfc7cd;
  font-size: 19px;
}

.is-selected .item-icon {
  color: #79d5e5;
}

.item-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.item-label,
.item-meta {
  overflow: hidden;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-label {
  font-size: 13px;
  font-weight: 600;
}

.item-meta {
  color: #929ca3;
  font-size: 11px;
}

.visibility-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 4px;
  color: #b8c0c6;
  font-size: 18px;
  border-radius: 5px;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }
}

.empty-state {
  margin: 0;
  padding: 32px 16px;
  color: #929ca3;
  font-size: 12px;
  text-align: center;
}
</style>
