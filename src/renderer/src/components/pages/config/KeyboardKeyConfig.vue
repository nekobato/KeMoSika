<script setup lang="ts">
import * as EP from "element-plus";
</script>

<template>
  <section class="keyboard-key-config">
    <EP.ElButton type="primary">Primary</EP.ElButton>
  </section>
</template>

<style scoped lang="scss">
.keyboard-key-config {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  min-width: 320px;
  border: 1px solid #e0e0e0;
}
</style>
