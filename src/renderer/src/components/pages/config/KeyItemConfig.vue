<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  key: {
    type: Object,
    required: true
  }
});

const key = ref();
</script>

<template>
  <Key ref="key" :key="key" />
</template>

<style scoped lang="scss">
.key-layout-config {
  position: relative;
  overflow: scroll;
  width: 100%;
  height: 100%;

  --dot-bg: #2f3336;
  --dot-color: #84878a;
  --dot-size: 1px;
  --dot-space: 20px;
  background: linear-gradient(
        90deg,
        var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
        transparent 1%
      )
      center / var(--dot-space) var(--dot-space),
    linear-gradient(
        var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
        transparent 1%
      )
      center / var(--dot-space) var(--dot-space),
    var(--dot-color);
}

.key-config-item {
  display: contents;
}
</style>
