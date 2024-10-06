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
  return store.$state.layouts[selectedLayoutIndex.value];
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

const gotoEdit = () => {
  router.push("/edit");
};

const gotoVisualizer = () => {
  router.push("/visualizer");
};
</script>

<template>
  <ConfigLayout class="layout-preview kmsk-dotted-background">
    <Header />
    <div class="container">
      <div class="preview-container">
        <div class="padding-area">
          <div class="preview kmsk-dotted-background" :style="layoutStyle">
            <KeyboardButton
              v-for="key in keys"
              class="keyboard-key"
              :key-data="key as KeyboardKeyData"
              :is-down="false"
            />
            <Mouse v-for="mouse in mouses" :data="mouse" />
          </div>
          <div class="actions">
            <NNButton @click="gotoEdit">
              <template #icon>
                <Icon icon="mingcute:edit-line" />
              </template>
              <span>編集</span>
            </NNButton>
            <NNButton @click="gotoVisualizer">
              <template #icon>
                <Icon icon="mingcute:eye-line" />
              </template>
              <span>開始</span>
            </NNButton>
          </div>
        </div>
      </div>
      <div class="list-column">
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
          <button class="add-button" @click="addLayout">
            追加<Icon icon="mingcute:file-new-line" />
          </button>
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
  overflow-y: scroll;
  height: 100%;

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

  .actions {
    position: fixed;
    bottom: 16px;
    right: 16px;
    display: flex;
    gap: 16px;
  }
}
</style>
