<script setup lang="ts">
import { ref } from "vue";
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

const saveImage = async (imagePath: string) => {
  try {
    await window.ipc.invoke("image:save", { imagePath });
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
  const imagePath = e.dataTransfer?.files[0].path;
  if (imagePath) {
    await saveImage(imagePath);
  }
};

const onDragLeave = (_: DragEvent) => {
  isDragOver.value = false;
};

const selectImage = (index: number) => {
  console.log("selectImage", index, props.item, props.type);
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
      v-for="(image, index) in props.images"
      :key="image.id"
    >
      <img
        class="image"
        :src="`media://images/${image.fileName}`"
        @click="selectImage(index)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-list {
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: start;
  align-items: start;
  align-content: start;
  flex-wrap: wrap;
  padding: 8px;

  &.is-dragover {
    background-color: #252525;
  }

  .image-list-item {
    width: 160px;
    height: 160px;
    padding: 8px;
    border: 1px solid #333;
    cursor: pointer;

    &:hover {
      border: 1px solid #fff;
    }
    .image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
