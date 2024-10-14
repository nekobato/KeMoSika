<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps({
  value: String,
  label: String
});
</script>

<template>
  <div class="image-input">
    <span class="label">{{ label }}</span>
    <Icon class="icon" icon="mingcute:add-line" v-if="!value" />
    <img class="image" v-if="value" :src="'media://' + value" />
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

  > .label {
    position: absolute;
    bottom: 4px;
    left: 4px;
    color: #4c4d4f;
    font-size: 14px;
  }

  .image {
    object-fit: contain;
  }

  .icon {
    font-size: 24px;
    color: #4c4d4f;
  }
}
</style>
