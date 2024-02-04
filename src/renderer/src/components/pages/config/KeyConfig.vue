<script setup lang="ts">
import NNButton from "@renderer/components/common/NNButton.vue";
import { useStore } from "@renderer/store";
import { nanoid } from "nanoid/non-secure";

const store = useStore();

const addKey = () => {
  store.addKey({
    id: nanoid(),
    key: "a",
    type: "normal",
    x: 0,
    y: 0,
    size: 40,
    width: 40
  });
};
</script>

<template>
  <div class="key-config">
    <NNButton class="add-key-button" @click="addKey">キー追加</NNButton>
  </div>
</template>

<style scoped lang="scss">
.key-config {
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  padding: 16px;
  margin: 0;
}
</style>
