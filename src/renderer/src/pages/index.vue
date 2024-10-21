<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "../store";
import NNButton from "@/components/common/NNButton.vue";
import { Icon } from "@iconify/vue";
import ConfigLayout from "@/components/layouts/ConfigLayout.vue";
import KeyboardButton from "@/components/KeyboardButton.vue";
import { KeyboardKeyData } from "@shared/types";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Mouse from "@/components/Mouse.vue";

const router = useRouter();
const store = useStore();

const selectedLayoutIndex = ref(0);

const selectedLayout = computed(() => {
  return store.$state.layouts?.length
    ? store.$state.layouts[selectedLayoutIndex.value]
    : undefined;
});

const layoutStyle = computed(() => {
  return {
    width: `${selectedLayout.value?.width}px`,
    height: `${selectedLayout.value?.height}px`
  };
});

const keys = computed<KeyboardKeyData[]>(() =>
  selectedLayout.value?.keys.filter((key) => key.type === "key")
);

const mouses = computed(() => {
  return selectedLayout.value?.keys.filter((key) => key.type === "mouse");
});

const addLayout = () => {
  store.addLayout();
};

const deleteLayout = () => {
  store.deleteLayout(selectedLayoutIndex.value);
};

const gotoEdit = () => {
  router.push(`/edit/${store.$state.layouts[selectedLayoutIndex.value].id}`);
};

const gotoVisualizer = () => {
  router.push(
    `/visualizer/${store.$state.layouts[selectedLayoutIndex.value].id}`
  );
};
</script>

<template>
  <ConfigLayout class="layout-preview kmsk-dotted-background">
    <Header>
      <div class="tools">
        <div class="center-group">
          <button class="nn-button type-ghost" @click="addLayout">
            <Icon icon="mingcute:file-new-line" class="nn-icon size-xsmall" />
          </button>
          <button class="nn-button type-ghost" @click="gotoEdit">
            <Icon icon="mingcute:edit-line" class="nn-icon size-xsmall" />
          </button>
          <button class="nn-button type-ghost" @click="deleteLayout">
            <Icon icon="mingcute:delete-2-line" class="nn-icon size-xsmall" />
          </button>
        </div>
        <div class="right-group">
          <button
            class="nn-button type-ghost visualize"
            @click="gotoVisualizer"
          >
            <Icon icon="mingcute:eye-line" class="nn-icon size-xsmall" />
          </button>
        </div>
      </div>
    </Header>
    <div class="container">
      <div class="preview-container">
        <div class="padding-area">
          <div
            class="preview kmsk-dotted-background"
            v-if="selectedLayout"
            :style="layoutStyle"
          >
            <KeyboardButton
              v-for="key in keys"
              class="keyboard-key"
              :key-data="key as KeyboardKeyData"
              :is-down="false"
            />
            <Mouse v-for="mouse in mouses" :data="mouse" />
          </div>
        </div>
      </div>
      <div class="list-column">
        <h3 class="category-title">カスタム</h3>
        <div class="layout-list">
          <label
            class="list-item"
            v-for="(layout, index) in store.$state.layouts"
            :class="{
              selected: selectedLayoutIndex === index
            }"
          >
            <input
              class="radio"
              type="radio"
              key="layout"
              :value="index"
              v-model="selectedLayoutIndex"
            />
            <span class="label">{{ layout.name }}</span>
          </label>
        </div>
        <div class="bottom-actions">
          <button class="nn-button">
            <Icon icon="mingcute:file-new-line" class="nn-icon size-xsmall" />
            <span>新しいレイアウト</span>
          </button>
        </div>
        <h3 class="category-title">テンプレート</h3>
        <div class="layout-list">
          <label
            class="list-item"
            v-for="(layout, index) in store.$state.layouts"
            :class="{
              selected: selectedLayoutIndex === index
            }"
          >
            <input
              class="radio"
              type="radio"
              key="layout"
              :value="index"
              v-model="selectedLayoutIndex"
            />
            <span class="label">{{ layout.name }}</span>
          </label>
        </div>
      </div>
    </div>
  </ConfigLayout>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 320px;
  overflow: hidden;

  .list-column {
    height: 100%;
    background-color: #252525;
    overflow-y: scroll;
  }

  .preview-container {
    position: relative;
    background-color: #e5e5e5;
    overflow: hidden;
  }

  .preview {
    flex: 0 0 auto;
    position: relative;
  }
}

.padding-area {
  overflow: scroll;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.layout-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  flex-wrap: nowrap;

  .list-item {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 8px;

    &:hover {
      background-color: var(--color-white-t1);
    }

    &.selected {
      background-color: var(--color-accent);
      cursor: default;
    }

    .label {
      font-size: 16px;
      font-weight: bold;
    }
  }
}

.radio {
  display: none;
}

.add-button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 16px;
  margin: auto auto 56px auto;
  cursor: pointer;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  color: #bababa;
  background: transparent;
  font-weight: bold;
  &:hover {
    background-color: var(--color-white-t1);
  }

  svg {
    margin: 0 0 0 auto;
    width: 20px;
    height: 20px;
  }
}

.layout-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.tools {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .center-group {
    position: absolute;
    top: 0;
    margin: 0 auto;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .right-group {
    margin: 0 8px 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .nn-button {
    margin: auto;
    width: 40px;
    height: 24px;
    padding: 0;
    min-height: auto;
    -webkit-app-region: no-drag;
  }
}
</style>
