<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "../store";
import { Icon } from "@iconify/vue";
import ConfigLayout from "@/components/layouts/ConfigLayout.vue";
import KeyboardButton from "@/components/KeyboardButton.vue";
import { KeyboardKeyData, LayoutData } from "@shared/types";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Mouse from "@/components/Mouse.vue";
import Divider from "primevue/divider";
import ButtonGroup from "primevue/buttongroup";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import FloatActions from "@/components/FloatActions/FloatActions.vue";

type LayoutSource = "user" | "builtin";

const router = useRouter();
const store = useStore();

const userLayouts = computed(() => store.$state.layouts || []);
const builtinLayouts = computed(() => store.builtinLayouts || []);

const selectedLayoutKey = ref("user:0");
const copyTargetLayout = ref<LayoutData | null>(null);
const showCopyDialog = ref(false);
const copyName = ref("");

const parseSelectionKey = (
  value: string
): { source: LayoutSource; index: number } => {
  const [source, index] = value.split(":");
  const parsedSource: LayoutSource = source === "builtin" ? "builtin" : "user";
  const parsedIndex = Number.isFinite(Number(index)) ? Number(index) : 0;
  return { source: parsedSource, index: Math.max(0, parsedIndex) };
};

const ensureValidSelection = () => {
  const userLength = userLayouts.value.length;
  const builtinLength = builtinLayouts.value.length;
  const { source, index } = parseSelectionKey(selectedLayoutKey.value);

  if (source === "user") {
    if (userLength === 0 && builtinLength > 0) {
      selectedLayoutKey.value = "builtin:0";
      return;
    }
    if (index >= userLength && userLength > 0) {
      selectedLayoutKey.value = `user:${userLength - 1}`;
      return;
    }
  }

  if (source === "builtin") {
    if (builtinLength === 0 && userLength > 0) {
      selectedLayoutKey.value = "user:0";
      return;
    }
    if (index >= builtinLength && builtinLength > 0) {
      selectedLayoutKey.value = `builtin:${builtinLength - 1}`;
    }
  }
};

watch([userLayouts, builtinLayouts], ensureValidSelection, { immediate: true });

const selectedLayout = computed<LayoutData | undefined>(() => {
  const { source, index } = parseSelectionKey(selectedLayoutKey.value);
  return source === "builtin"
    ? builtinLayouts.value[index]
    : userLayouts.value[index];
});

const selectedLayoutSource = computed<LayoutSource>(
  () => parseSelectionKey(selectedLayoutKey.value).source
);

const layoutStyle = computed(() => {
  return {
    width: `${selectedLayout.value?.width ?? 0}px`,
    height: `${selectedLayout.value?.height ?? 0}px`
  };
});

const keys = computed<KeyboardKeyData[] | undefined>(() =>
  selectedLayout.value?.keys.filter((key) => key.type === "key")
);

const mouses = computed(() => {
  return selectedLayout.value?.keys.filter((key) => key.type === "mouse");
});

const addLayout = async () => {
  await store.addLayout();
  selectedLayoutKey.value = `user:${Math.max(store.$state.layouts.length - 1, 0)}`;
};

const deleteLayout = async (index: number) => {
  await store.deleteLayout(index);
  ensureValidSelection();
};

const resetCopyDialog = () => {
  copyTargetLayout.value = null;
  copyName.value = "";
};

const closeCopyDialog = () => {
  showCopyDialog.value = false;
  resetCopyDialog();
};

const openCopyDialog = (layout: LayoutData) => {
  copyTargetLayout.value = layout;
  copyName.value = layout.name;
  showCopyDialog.value = true;
};

const confirmCopyLayout = async () => {
  if (!copyTargetLayout.value) return;
  const name = copyName.value.trim() || copyTargetLayout.value.name;
  await store.addLayout(copyTargetLayout.value, name);
  selectedLayoutKey.value = `user:${Math.max(store.$state.layouts.length - 1, 0)}`;
  closeCopyDialog();
};

const gotoEdit = () => {
  if (selectedLayoutSource.value !== "user" || !selectedLayout.value) return;
  router.push(`/edit/${selectedLayout.value.id}`);
};

const gotoVisualizer = () => {
  if (!selectedLayout.value) return;
  window.ipc.invoke("visualizer:start", {
    layoutId: selectedLayout.value.id,
    size: {
      width: selectedLayout.value.width,
      height: selectedLayout.value.height
    }
  });
};

const isBuiltinLayoutSelected = computed(
  () => selectedLayoutSource.value === "builtin" && !!selectedLayout.value
);

const handleLeftAction = () => {
  if (!selectedLayout.value) return;
  if (isBuiltinLayoutSelected.value) {
    openCopyDialog(selectedLayout.value);
  } else {
    gotoEdit();
  }
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
      <FloatActions>
        <ButtonGroup>
          <Button
            class="float-action-button"
            :disabled="!selectedLayout"
            @click="handleLeftAction"
            :aria-label="isBuiltinLayoutSelected ? 'Copy Layout' : 'Edit Layout'"
          >
            <Icon
              :icon="
                isBuiltinLayoutSelected
                  ? 'mingcute:file-copy-2-line'
                  : 'mingcute:edit-4-line'
              "
              class="action-icon size-xsmall"
            />
          </Button>
          <Button
            class="float-action-button type-primary"
            :disabled="!selectedLayout"
            @click="gotoVisualizer"
            aria-label="Open Visualizer"
          >
            <Icon icon="mingcute:play-fill" class="action-icon size-xsmall" />
          </Button>
        </ButtonGroup>
      </FloatActions>
    </template>
    <template #aside>
      <aside class="list-column">
        <div class="layout-list">
          <p class="category-title">マイレイアウト</p>
          <label
            class="list-item"
            v-for="(layout, index) in userLayouts"
            :class="{
              selected: selectedLayoutKey === `user:${index}`
            }"
          >
            <input
              class="radio"
              type="radio"
              key="layout"
              :value="`user:${index}`"
              v-model="selectedLayoutKey"
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
          <p class="category-title">デフォルトレイアウト</p>
          <label
            class="list-item"
            v-for="(layout, index) in builtinLayouts"
            :class="{
              selected: selectedLayoutKey === `builtin:${index}`
            }"
          >
            <input
              class="radio"
              type="radio"
              key="layout"
              :value="`builtin:${index}`"
              v-model="selectedLayoutKey"
            />
            <span class="label">{{ layout.name }}</span>
            <button
              class="nn-button type-ghost size-xsmall copy-button"
              @click.stop="openCopyDialog(layout)"
            >
              <Icon icon="mingcute:file-copy-2-line" class="nn-icon size-xsmall" />
            </button>
          </label>
        </div>
      </aside>
    </template>
    <template #dialog>
      <Dialog
        v-model:visible="showCopyDialog"
        modal
        :closable="true"
        :draggable="false"
        :baseZIndex="5000"
        appendTo="body"
        class="copy-dialog"
        @hide="resetCopyDialog"
      >
        <template #header>
          <div class="copy-dialog-header">
            <span class="copy-dialog-title">レイアウトをコピー</span>
          </div>
        </template>
        <div class="copy-dialog-body">
          <label class="copy-dialog-label" for="copy-layout-name">レイアウト名</label>
          <InputText
            id="copy-layout-name"
            v-model="copyName"
            class="copy-dialog-input"
            placeholder="レイアウト名を入力"
            autofocus
            @keyup.enter="confirmCopyLayout"
          />
        </div>
        <template #footer>
          <div class="copy-dialog-actions">
            <Button label="キャンセル" severity="secondary" text @click="closeCopyDialog" />
            <Button label="決定" :disabled="!copyTargetLayout" @click="confirmCopyLayout" />
          </div>
        </template>
      </Dialog>
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

      .delete-button,
      .copy-button {
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

    .copy-button {
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

.copy-dialog {
  .copy-dialog-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 0 16px;
  }

  .copy-dialog-label {
    font-size: 12px;
    color: var(--color-grey-500);
  }

  .copy-dialog-input {
    width: 100%;
  }

  .copy-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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

</style>
