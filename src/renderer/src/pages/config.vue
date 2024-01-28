<script setup lang="ts">
import { onMounted, ref } from "vue";
import KeyTable from "../components/Config/KeyTableList.vue";

const keys = ref([
  {
    id: 1,
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    color: "#ff0000"
  }
]);
</script>

<template>
  <div class="config-layout">
    <KeyTable :keys />
    <div class="preview"></div>
  </div>
</template>

<style scoped lang="scss">
.config-layout {
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr;
  width: 100%;
  height: 100%;
}

.preview {
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
</style>
