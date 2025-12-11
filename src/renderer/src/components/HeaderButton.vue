<script setup lang="ts">
import { Icon } from "@iconify/vue";
import Button from "primevue/button";

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
    <Button class="nn-button" text severity="secondary" :aria-label="props.text">
      <Icon :icon="props.icon" class="nn-icon size-small" />
      <span>{{ props.text }}</span>
    </Button>
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
}
</style>
