<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref } from "vue";

defineProps({
  label: String
});
const isDragOver = ref(false);

const onDragOver = (e: DragEvent) => {
  isDragOver.value = true;
};

const onDrop = (e: DragEvent) => {
  isDragOver.value = false;
};

const onDragLeave = (e: DragEvent) => {
  isDragOver.value = false;
};
</script>

<template>
  <div
    class="image-input"
    :class="{ 'on-dragover': isDragOver }"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
    @dragleave.prevent="onDragLeave"
  >
    <span class="label">{{ label }}</span>
    <Icon class="icon" icon="mingcute:add-line" />
  </div>
</template>

<style scoped lang="scss">
.image-input {
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 4px;
  border: 1px dashed #4c4d4f;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;

  &.on-dragover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  > .label {
    position: absolute;
    bottom: 4px;
    left: 4px;
    color: #4c4d4f;
    font-size: 14px;
  }

  .icon {
    font-size: 24px;
    color: #4c4d4f;
  }
}
</style>
