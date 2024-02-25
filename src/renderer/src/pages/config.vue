<script setup lang="ts">
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import Pagination from "../components/pages/config/Pagination.vue";
import NNButton from "../components/common/NNButton.vue";
import KeyConfig from "@renderer/components/pages/config/KeyConfig.vue";
import KeyLayoutConfig from "@renderer/components/pages/config/KeyLayoutConfig.vue";
</script>

<template>
  <ConfigLayout>
    <KeyConfig class="key-config" />
    <div class="preview">
      <KeyLayoutConfig />
      <Pagination />
      <NNButton class="start-button">スタート</NNButton>
    </div>
  </ConfigLayout>
</template>

<style scoped lang="scss">
.key-config {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: scroll;
}
.preview {
  position: relative;
  width: 100%;
}

.start-button {
  position: absolute;
  bottom: 16px;
  right: 16px;
}
</style>
