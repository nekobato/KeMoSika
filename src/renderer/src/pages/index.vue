<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "../store";
import { Icon } from "@iconify/vue";
import ConfigLayout from "@/components/layouts/ConfigLayout.vue";
import KeyboardButton from "@/components/KeyboardButton.vue";
import { KeyboardKeyData, LayoutData } from "@shared/types";
import { useRoute, useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Mouse from "@/components/Mouse.vue";
import ButtonGroup from "primevue/buttongroup";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Tree from "primevue/tree";
import FloatActions from "@/components/FloatActions/FloatActions.vue";
import type { TreeExpandedKeys, TreeSelectionKeys } from "primevue/tree";
import type { TreeNode } from "primevue/treenode";

type LayoutSource = "user" | "builtin";

const router = useRouter();
const route = useRoute();
const store = useStore();

const userLayouts = computed(() => store.$state.layouts || []);
const builtinLayoutTree = computed(() => store.builtinLayoutTree || []);
const builtinLayouts = computed(
  () => builtinLayoutTree.value.flatMap((group) => group.layouts) || []
);

const copyTargetLayout = ref<LayoutData | null>(null);
const showCopyDialog = ref(false);
const copyName = ref("");

const folderIcons = {
  // PrimeVue v4 treats presence of expanded/collapsedIcon as custom toggle icons.
  // Leaving only the node icon avoids blank toggle buttons.
  icon: "pi pi-folder"
};

const treeValue = computed<TreeNode[]>(() => {
  const userNodes: TreeNode[] = userLayouts.value.length
    ? userLayouts.value.map((layout) => ({
        key: layout.id,
        label: layout.name,
        type: "layout",
        data: layout,
        icon: "pi pi-th-large",
        selectable: true
      }))
    : [
        {
          key: "custom-empty",
          label: "カスタムレイアウトがありません",
          selectable: false,
          icon: "pi pi-info-circle"
        }
      ];

  const builtinNodes: TreeNode[] = builtinLayoutTree.value.map((group) => ({
    key: `group-${group.id}`,
    label: group.name,
    ...folderIcons,
    selectable: false,
    children: group.layouts.map((layout) => ({
      key: layout.id,
      label: layout.name,
      type: "layout",
      data: layout,
      icon: "pi pi-desktop",
      selectable: true
    }))
  }));

  return [
    {
      key: "custom-layouts",
      label: "カスタムレイアウト",
      ...folderIcons,
      selectable: false,
      children: userNodes
    },
    {
      key: "builtin-layouts",
      label: "デフォルトレイアウト",
      ...folderIcons,
      selectable: false,
      children: builtinNodes
    }
  ];
});

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

const expandedKeys = ref<TreeExpandedKeys>({});
const selectionKeys = ref<TreeSelectionKeys>({});

watch(
  treeValue,
  (nodes) => {
    const nextExpanded: TreeExpandedKeys = {};
    const traverse = (treeNodes: TreeNode[]) => {
      treeNodes.forEach((node) => {
        if (node.children?.length) {
          nextExpanded[node.key] = true;
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    expandedKeys.value = nextExpanded;
  },
  { immediate: true }
);

watch(
  selectedLayout,
  (layout) => {
    selectionKeys.value = layout ? { [layout.id]: true } : {};
  },
  { immediate: true }
);

const handleLeftAction = () => {
  if (!selectedLayout.value) return;
  if (isBuiltinLayoutSelected.value) {
    openCopyDialog(selectedLayout.value);
  } else {
    gotoEdit();
  }
};

const handleNodeSelect = (node: TreeNode) => {
  const layout = node.data as LayoutData | undefined;
  if (!layout) return;
  navigateToLayout(layout.id);
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
        <div class="aside-header">
          <Button
            class="nn-button primary"
            @click="addLayout"
            aria-label="Add Layout"
            size="small"
          >
            <Icon icon="mingcute:file-new-line" class="nn-icon" />
            <span>新規作成</span>
          </Button>
        </div>
        <Tree
          class="layout-tree"
          :value="treeValue"
          selectionMode="single"
          :expandedKeys="expandedKeys"
          v-model:selectionKeys="selectionKeys"
          @node-select="handleNodeSelect"
          @nodeSelect="handleNodeSelect"
          :pt="{
            root: { class: 'layout-tree-root' },
            node: { class: 'layout-tree-node' }
          }"
        />
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
  width: 100%;
}
.preview-container {
  width: 100%;
  height: 100%;
  padding: 80px;
  position: relative;
  background-color: #e5e5e5;
  overflow: scroll;
  padding-right: 320px;
}

.preview {
  flex: 0 0 auto;
  position: relative;
}

.category-title {
  font-size: 20px;
  margin: 16px auto auto 0;
}

.aside-header {
  padding: 16px 16px 0;
}

.layout-tree {
  padding: 8px 0 0;
}

:deep(.p-tree) {
  border: none;
  background: transparent;
  color: #fff;
}

:deep(.p-tree .p-tree-node-content) {
  padding: 6px 8px;
  border-radius: 6px;
}

:deep(.p-tree .p-treenode-content) {
  gap: 6px;
}

:deep(.p-tree .p-tree-toggler) {
  color: #fff;
  margin-right: 4px;
}

:deep(.p-tree .p-treenode-selectable .p-tree-node-content) {
  cursor: pointer;
}

:deep(.p-tree .p-highlight > .p-tree-node-content) {
  background: var(--color-teal-400);
  color: #000;
}

:deep(.p-tree .p-treenode .p-tree-node-content:hover) {
  background: var(--color-white-t50);
}

:deep(.p-tree .p-treenode-children) {
  padding-left: 16px;
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
