<script setup lang="ts">
import { computed, ref } from "vue";
import { LayoutItemData, LayoutItemImage } from "@shared/types";
import { InputImageType } from "@/types/app";

const props = defineProps<{
  images: LayoutItemImage[];
  item?: LayoutItemData;
  type?: InputImageType;
}>();

const emit = defineEmits<{
  (
    e: "select",
    payload: {
      itemId: string;
      type: InputImageType;
      imageId: string;
    }
  ): void;
  (e: "update"): void;
}>();

const isDragOver = ref(false);
const isSelectable = computed(() => Boolean(props.item && props.type));

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

const selectImage = (index: number) => {
  if (!props.item || !props.type) return;

  emit("select", {
    itemId: props.item.id,
    type: props.type,
    imageId: props.images[index].id
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
    <div
      class="image-list-item"
      :class="{ 'is-selectable': isSelectable }"
      v-for="(image, index) in props.images"
      :key="image.id"
    >
      <img
        class="image"
        :alt="image.fileName"
        :src="`media://images/${image.fileName}`"
        @click="selectImage(index)"
      />
    </div>
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 6px;

    &.is-selectable {
      cursor: pointer;

      &:hover {
        border-color: #67c7d9;
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
