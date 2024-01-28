<script setup lang="ts">
import { ref } from "vue";
import { nanoid } from "nanoid/non-secure";
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import KeyTable from "../components/Config/KeyTableList.vue";

const keys = ref(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => ({
    id: nanoid(),
    key: "A",
    type: "normal",
    x: 0,
    y: 0,
    size: 48,
    width: 48,
    color: "#ff0000"
  }))
);
</script>

<template>
  <ConfigLayout>
    <KeyTable class="key-table" :keys="keys" />
    <div class="preview"></div>
  </ConfigLayout>
</template>

<style scoped lang="scss">
.key-table {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: scroll;
  flex-wrap: nowrap;
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
