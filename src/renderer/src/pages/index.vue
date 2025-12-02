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
import Divider from "primevue/divider";
import FloatActions from "@/components/FloatActions/FloatActions.vue";
import FloatActionButton from "@/components/FloatActions/FloatActionButton.vue";

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

const keys = computed<KeyboardKeyData[] | undefined>(() =>
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
  window.ipc.invoke("visualizer:start", {
    layoutId: store.$state.layouts[selectedLayoutIndex.value].id,
    size: {
      width: selectedLayout.value?.width,
      height: selectedLayout.value?.height
    }
  });
};
</script>

<template>
  <ConfigLayout class="layout-preview kmsk-dotted-background">
    <template #header>
      <Header class="header" />
    </template>
    <template #main>
      <main class="preview-container">
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
      </main>
      <FloatActions class="float-actions">
        <FloatActionButton @click="gotoEdit">
          <template #icon>
            <Icon icon="mingcute:edit-4-line" class="nn-icon size-xsmall" />
          </template>
        </FloatActionButton>
        <FloatActionButton class="type-primary" @click="gotoVisualizer">
          <template #icon>
            <Icon icon="mingcute:play-fill" class="nn-icon size-xsmall" />
          </template>
        </FloatActionButton>
      </FloatActions>
    </template>
    <template #aside>
      <aside class="list-column">
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
          <button class="nn-button" @click="addLayout">
            <Icon icon="mingcute:file-new-line" class="nn-icon size-xsmall" />
            <span>新規作成</span>
          </button>
        </div>
        <Divider />
        <div class="layout-list">
          <label
            class="list-item"
            v-for="(layout, index) in [] as any"
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
      </aside>
    </template>
  </ConfigLayout>
</template>

<style lang="scss" scoped>
.list-column {
  width: 240px;
  height: 100%;
  background-color: #252525;
  overflow-y: scroll;
}

.preview-container {
  width: 100%;
  height: 100%;
  padding: 80px;
  position: relative;
  background-color: #e5e5e5;
  overflow: scroll;
  padding-right: 240px;
}

.preview {
  flex: 0 0 auto;
  position: relative;
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
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 8px;

    &:hover {
      background-color: var(--color-white-t50);

      .delete-button {
        visibility: visible;
      }
    }

    &.selected {
      background-color: var(--color-teal-400);
      cursor: default;
    }

    .label {
      font-size: var(--font-size-14);
      font-weight: bold;
    }

    .delete-button {
      position: absolute;
      right: 8px;
      width: 24px;
      height: 24px;
      margin: auto 0 auto auto;
      visibility: hidden;
    }
  }

  .nn-button {
    margin-top: 8px;
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
    background-color: var(--color-white-t50);
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

.float-actions {
  .type-primary {
    width: 80px;
  }
}
</style>
