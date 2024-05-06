<script setup lang="ts">
import ConfigLayout from "../components/layouts/ConfigLayout.vue";
import Pagination from "../components/pages/config/Pagination.vue";
import NNButton from "../components/common/NNButton.vue";
import KeyLayoutConfig from "@renderer/components/pages/config/KeyLayoutConfig.vue";
import { useStore } from "@renderer/store";

const store = useStore();

const addKey = () => {
  store.$state.keys.push({
    id: "0",
    key: "A",
    type: "normal",
    size: 64,
    width: 64,
    x: 100,
    y: 100
  });
};
</script>

<template>
  <ConfigLayout>
    <KeyLayoutConfig />
    <Pagination />
    <NNButton class="start-button">スタート</NNButton>
    <NNButton class="add-button" @click="addKey">追加</NNButton>
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
