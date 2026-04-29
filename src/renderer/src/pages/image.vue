<script setup lang="ts">
import { ref, onMounted } from "vue";
import ConfigLayout from "@/components/layouts/ConfigLayout.vue";
import Header from "@/components/Header.vue";
import { LayoutItemImage } from "@shared/types";

type ImageData = LayoutItemImage & {
  path: string;
};

const isDragOver = ref(false);
const images = ref<ImageData[]>([]);

const onDragOver = (_: DragEvent) => {
  isDragOver.value = true;
};

const onDrop = async (e: DragEvent) => {
  isDragOver.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) {
    const buffer = await file.arrayBuffer();
    await window.kemosikaApi.saveImageBuffer({ buffer });

    images.value = await window.kemosikaApi.listImages();
  }
};

const onDragLeave = (_: DragEvent) => {
  isDragOver.value = false;
};

onMounted(async () => {
  images.value = await window.kemosikaApi.listImages();
});
</script>

<template>
  <ConfigLayout class="layout-preview">
    <Header />
    <div class="container">
      <div
        class="image-list"
        :class="{ 'is-dragover': isDragOver }"
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
        @dragleave.prevent="onDragLeave"
      >
        <div class="image-item" v-for="image in images" :key="image.id">
          <img class="image" :src="`media://${image.path}`" />
        </div>
      </div>
      <div class="list-column"></div>
    </div>
  </ConfigLayout>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 320px;
  overflow: hidden;

  .list-column {
    height: 100%;
    background-color: #252525;
  }
}

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

  .image-item {
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
