<script setup lang="ts">
import { computed, ref } from "vue";
import type { LayoutItemImage } from "@shared/types";
import type {
  ImageSelectionPayload,
  ImageSelectionTarget,
} from "@/types/app";

const props = defineProps<{
  images: LayoutItemImage[];
  target?: ImageSelectionTarget;
}>();

const emit = defineEmits<{
  select: [payload: ImageSelectionPayload];
  update: [];
}>();

const isDragOver = ref(false);
const isSelectable = computed(() => Boolean(props.target));

const saveImage = async (file: File) => {
  try {
    const buffer = await file.arrayBuffer();
    await window.kemosikaApi.saveImageBuffer({ buffer });
    emit("update");
  } catch (error) {
    console.error("Failed to save image:", error);
  }
};

const onDragOver = (_: DragEvent) => {
  isDragOver.value = true;
};

const onDrop = async (e: DragEvent) => {
  isDragOver.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) {
    await saveImage(file);
  }
};

const onDragLeave = (_: DragEvent) => {
  isDragOver.value = false;
};

const selectImage = (imageId: string) => {
  if (!props.target) return;

  emit("select", {
    target: props.target,
    imageId,
  });
};
</script>

<template>
  <div
    class="image-list"
    :class="{ 'is-dragover': isDragOver }"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
    @dragleave.prevent="onDragLeave"
  >
    <button
      class="image-list-item"
      :class="{ 'is-selectable': isSelectable }"
      v-for="image in props.images"
      :key="image.id"
      type="button"
      :disabled="!isSelectable"
      :aria-label="isSelectable ? `${image.fileName}を選択` : undefined"
      @click="selectImage(image.id)"
    >
      <img
        class="image"
        :alt="image.fileName"
        :src="`media://images/${image.fileName}`"
      />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
  width: 100%;
  min-height: 240px;
  padding: 12px;
  background: #202225;
  border-radius: 8px;

  &.is-dragover {
    background-color: rgba(103, 199, 217, 0.12);
  }

  .image-list-item {
    aspect-ratio: 1;
    padding: 8px;
    color: inherit;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 6px;

    &:disabled {
      opacity: 1;
    }

    &.is-selectable {
      cursor: pointer;

      &:hover,
      &:focus-visible {
        border-color: #67c7d9;
      }

      &:focus-visible {
        outline: 2px solid #67c7d9;
        outline-offset: 2px;
      }
    }

    .image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
