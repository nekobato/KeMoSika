<script setup lang="ts">
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import KeyTable from "../components/pages/config/KeyTableList.vue";
import Pagination from "../components/pages/config/Pagination.vue";
</script>

<template>
  <ConfigLayout>
    <KeyTable class="key-table" />
    <div class="preview">
      <Pagination />
    </div>
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
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
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
