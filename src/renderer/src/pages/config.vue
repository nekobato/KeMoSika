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
      <div class="overlay-ui">
        <Pagination />
        <NNButton class="start-button">スタート</NNButton>
      </div>
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

.overlay-ui {
  top: 0;
  left: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 16px;
}

.start-button {
  position: absolute;
  bottom: 16px;
  right: 16px;
}
</style>
