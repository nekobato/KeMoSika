<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "../store";
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

const deleteLayout = (index: number) => {
  store.deleteLayout(index);
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
    <Header />
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
        <div class="float-actions">
          <button class="nn-button type-ghost edit" @click="gotoEdit">
            <Icon icon="mingcute:edit-line" class="nn-icon size-small" />
            <span class="label">編集</span>
          </button>
          <button
            class="nn-button type-ghost visualize"
            @click="gotoVisualizer"
          >
            <Icon icon="mingcute:eye-line" class="nn-icon size-small" />
            <span class="label">可視化開始</span>
          </button>
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
            <button
              class="nn-button type-ghost size-xsmall delete-button"
              @click.stop="deleteLayout(index)"
            >
              <Icon icon="mingcute:delete-2-line" class="nn-icon size-xsmall" />
            </button>
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

.float-actions {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  width: 320px;
  display: inline-flex;
  margin: auto;
  /* glassmorphic */
  background: rgba(45, 57, 62, 0.5);
  border-radius: 8px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(45, 57, 62, 0.16);

  .nn-button {
    width: 50%;
    &:not(:first-of-type) {
      border-left: 1px solid rgba(45, 57, 62, 0.16);
    }

    .nn-icon {
      flex: 0 0 auto;
      margin: auto auto auto 0;
    }

    .label {
      flex: 0 0 auto;
      font-size: 14px;
    }
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

.category-title {
  font-size: 20px;
  margin: 16px auto auto 16px;
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

      .delete-button {
        visibility: visible;
      }
    }

    &.selected {
      background-color: var(--color-accent);
      cursor: default;
    }

    .label {
      font-size: 16px;
      font-weight: bold;
    }

    .delete-button {
      position: absolute;
      right: 20px;
      height: 32px;
      margin: auto 0 auto auto;
      visibility: hidden;
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
