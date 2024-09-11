<script setup lang="ts">
import { ref } from "vue";
import { useStore } from "../store";
import NNButton from "@/components/common/NNButton.vue";

const store = useStore();

const selectedLayoutIndex = ref(0);
</script>

<template>
  <div class="container">
    <div class="layout-list">
      <label
        class="list-item"
        v-for="(layout, index) in store.$state.layouts"
        :class="{
          selected: selectedLayoutIndex === index
        }"
      >
        <input
          type="radio"
          :key="layout.id"
          :id="layout.id"
          :value="layout.id"
          v-model="selectedLayoutIndex"
        />
        <span class="label">{{ layout.name }}</span>
      </label>
    </div>
    <div class="layout-preview">
      <KeyboardLayoutPreview
        :layout="store.$state.layouts[selectedLayoutIndex]"
      />
      <NNButton>編集</NNButton>
      <NNButton>可視化 開始</NNButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 240px 1fr;
}

.layout-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background-color: #333;
  flex-wrap: nowrap;
  overflow-y: scroll;

  .list-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    cursor: pointer;
    border: 1px solid var(--color-white);

    &.selected {
      background-color: var(--color-accent);
    }
  }
}
</style>
