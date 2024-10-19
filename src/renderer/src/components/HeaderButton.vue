<script setup lang="ts">
import { Icon } from "@iconify/vue";

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="window-header">
    <button class="nn-button type-ghost">
      <Icon :icon="props.icon" class="nn-icon size-small" />
      <span>{{ props.text }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.window-header {
  position: relative;
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  align-items: center;
  height: 40px;
  overflow: hidden;
  background-color: #3b3940;
  -webkit-app-region: drag;
  width: 100%;
}
.nn-button {
  width: 80px;
  height: 24px;
  min-height: auto;
  -webkit-app-region: no-drag;
  &.exit {
    margin: auto auto auto 80px;
  }
}
</style>
