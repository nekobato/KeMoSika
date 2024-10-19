<script setup lang="ts">
import { ref, onMounted } from "vue";
import { LayoutItemImage } from "@shared/types";

type ImageData = LayoutItemImage & {
  path: string;
};

const isDragOver = ref(false);
const images = ref<ImageData[]>([]);

const saveImage = async (imagePath: string) => {
  try {
    await window.ipc.invoke("image:save", { imagePath });
  } catch (error) {
    console.error("Failed to save image:", error);
  }
};

const fetchImages = async () => {
  try {
    images.value = await window.ipc.invoke("image:list");
  } catch (error) {
    console.error("Failed to fetch images:", error);
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
    await fetchImages();
  }
};

const onDragLeave = (_: DragEvent) => {
  isDragOver.value = false;
};

onMounted(() => {
  fetchImages();
});
</script>

<template>
  <div
    class="image-list"
    :class="{ 'is-dragover': isDragOver }"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
    @dragleave.prevent="onDragLeave"
  >
    <div class="image-list-item" v-for="image in images" :key="image.id">
      <img class="image" :src="`media://${image.path}`" />
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
    .image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>
