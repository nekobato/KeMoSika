<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "../store";
import { Icon } from "@iconify/vue";
import ConfigLayout from "@/components/layouts/ConfigLayout.vue";
import KeyboardButton from "@/components/KeyboardButton.vue";
import { KeyboardKeyData, LayoutData } from "@shared/types";
import { type NavigationFailure, useRoute, useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Mouse from "@/components/Mouse.vue";
import Divider from "primevue/divider";
import ButtonGroup from "primevue/buttongroup";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import FloatActions from "@/components/FloatActions/FloatActions.vue";
import Tree from "primevue/tree";

type LayoutSource = "user" | "builtin";

const router = useRouter();
const route = useRoute();
const store = useStore();

const userLayouts = computed(() => store.$state.layouts || []);
const builtinLayoutTree = computed(() => store.builtinLayoutTree || []);
const builtinLayouts = computed(() =>
  builtinLayoutTree.value.flatMap((group) => group.layouts) || []
);
const treeSelection = ref<Record<string, boolean>>({});
const expandedKeys = ref<Record<string, boolean>>({});

const treeNodes = computed(() =>
  builtinLayoutTree.value.map((group) => ({
    key: `group-${group.id}`,
    label: group.name,
    children: group.layouts.map((layout) => ({
      key: layout.id,
      label: layout.name,
      data: layout,
      type: "layout"
    }))
  }))
);

const copyTargetLayout = ref<LayoutData | null>(null);
const showCopyDialog = ref(false);
const copyName = ref("");

const findLayoutById = (layoutId?: string) => {
  if (!layoutId) return undefined;
  return (
    userLayouts.value.find((layout) => layout.id === layoutId) ??
    builtinLayouts.value.find((layout) => layout.id === layoutId)
  );
};

const findLayoutSource = (layoutId?: string): LayoutSource | null => {
  if (!layoutId) return null;
  if (userLayouts.value.some((layout) => layout.id === layoutId)) return "user";
  if (builtinLayouts.value.some((layout) => layout.id === layoutId))
    return "builtin";
  return null;
};

const navigateOnKeydown = (
  navigateFn: (e?: MouseEvent) => Promise<void | NavigationFailure>
) => {
  void navigateFn();
};

const navigateToLayout = (layoutId: string, replace = false) => {
  const currentId = route.query.layoutId as string | undefined;
  if (currentId === layoutId) return;
  const navigate = replace ? router.replace : router.push;
  navigate({ name: "Index", query: { layoutId } });
};

const ensureValidSelection = () => {
  if (!userLayouts.value.length && !builtinLayouts.value.length) return;
  const layoutId = route.query.layoutId as string | undefined;
  if (findLayoutById(layoutId)) return;
  const fallback = userLayouts.value[0] ?? builtinLayouts.value[0];
  if (fallback) {
    navigateToLayout(fallback.id, true);
  }
};

watch(
  [userLayouts, builtinLayouts, () => route.query.layoutId],
  ensureValidSelection,
  {
    immediate: true
  }
);

const selectedLayout = computed<LayoutData | undefined>(() =>
  findLayoutById(route.query.layoutId as string | undefined)
);

const selectedLayoutSource = computed<LayoutSource | null>(() =>
  findLayoutSource(route.query.layoutId as string | undefined)
);

watch(
  [builtinLayoutTree, () => route.query.layoutId],
  ([groups, layoutId]) => {
    const nextExpanded: Record<string, boolean> = {};
    groups.forEach((g) => {
      nextExpanded[`group-${g.id}`] = true;
    });
    expandedKeys.value = nextExpanded;

    if (layoutId) {
      treeSelection.value = { [layoutId as string]: true };
    } else {
      treeSelection.value = {};
    }
  },
  { immediate: true }
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
  const layout = await store.addLayout();
  navigateToLayout(layout.id);
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
  const layout = await store.addLayout(copyTargetLayout.value, name);
  navigateToLayout(layout.id);
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

const onTreeSelect = (node: any) => {
  if (node?.type === "layout" && node?.key) {
    navigateToLayout(node.key);
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
            :aria-label="
              isBuiltinLayoutSelected ? 'Copy Layout' : 'Edit Layout'
            "
          >
            <Icon
              :icon="
                isBuiltinLayoutSelected
                  ? 'mingcute:file-copy-2-line'
                  : 'mingcute:edit-4-line'
              "
              class="action-icon"
            />
          </Button>
          <Button
            class="float-action-button type-primary"
            :disabled="!selectedLayout"
            @click="gotoVisualizer"
            aria-label="Open Visualizer"
          >
            <Icon icon="mingcute:play-fill" class="action-icon" />
          </Button>
        </ButtonGroup>
      </FloatActions>
    </template>
    <template #aside>
      <aside class="list-column">
        <div class="layout-list">
          <p class="category-title">マイレイアウト</p>
          <RouterLink
            v-for="(layout, index) in userLayouts"
            :key="layout.id"
            :to="{ name: 'Index', query: { layoutId: layout.id } }"
            custom
            v-slot="{ navigate }"
          >
            <div
              class="list-item"
              :class="{ selected: selectedLayout?.id === layout.id }"
              role="link"
              tabindex="0"
              @click="navigate"
              @keydown.enter.prevent="navigateOnKeydown(navigate)"
              @keydown.space.prevent="navigateOnKeydown(navigate)"
            >
              <span class="label">{{ layout.name }}</span>
              <Button
                class="nn-button delete-button"
                text
                severity="secondary"
                @click.stop="deleteLayout(index)"
                aria-label="Delete Layout"
              >
                <Icon icon="mingcute:delete-2-line" class="nn-icon" />
              </Button>
            </div>
          </RouterLink>
          <Button
            class="nn-button"
            @click="addLayout"
            aria-label="Add Layout"
            size="small"
          >
            <Icon icon="mingcute:file-new-line" class="nn-icon" />
            <span>新規作成</span>
          </Button>
        </div>
        <Divider />
        <div class="layout-tree">
          <p class="category-title">デフォルトレイアウト</p>
          <Tree
            :value="treeNodes"
            selectionMode="single"
            v-model:selectionKeys="treeSelection"
            :expandedKeys="expandedKeys"
            @node-select="onTreeSelect"
            class="nn-tree"
          >
            <template #default="{ node }">
              <div class="tree-node">
                <span class="label">{{ node.label }}</span>
                <Button
                  v-if="node.type === 'layout'"
                  class="nn-button copy-button"
                  text
                  severity="secondary"
                  @click.stop="openCopyDialog(node.data)"
                  aria-label="Copy Layout"
                >
                  <Icon icon="mingcute:file-copy-2-line" class="nn-icon" />
                </Button>
              </div>
            </template>
          </Tree>
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
          <label class="copy-dialog-label" for="copy-layout-name"
            >レイアウト名</label
          >
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
            <Button
              label="キャンセル"
              severity="secondary"
              text
              @click="closeCopyDialog"
            />
            <Button
              label="決定"
              :disabled="!copyTargetLayout"
              @click="confirmCopyLayout"
            />
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
.layout-tree {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px;
}

.layout-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.group-title {
  font-size: 14px;
  color: var(--color-grey-400);
  margin: 0 0 2px 4px;
}

.nn-tree {
  background: transparent;
  border: none;
  color: #fff;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
}

.p-treenode-content {
  border-radius: 8px;
}

.p-highlight > .p-treenode-content {
  background: var(--color-teal-400);
}

.p-tree-toggler {
  color: #ccc;
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
