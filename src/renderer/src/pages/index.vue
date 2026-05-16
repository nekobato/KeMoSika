<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
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
import { useToast } from "primevue/usetoast";
import type { TreeExpandedKeys, TreeSelectionKeys } from "primevue/tree";
import type { TreeNode } from "primevue/treenode";

type LayoutSource = "user" | "builtin";

const router = useRouter();
const route = useRoute();
const store = useStore();
const toast = useToast();
const previewContainerRef = ref<HTMLElement>();
const previewRef = ref<HTMLElement>();
const previewPadding = 1200;

const userLayouts = computed(() => store.$state.layouts || []);
const builtinLayoutTree = computed(() => store.builtinLayoutTree || []);
const builtinLayouts = computed(
  () => builtinLayoutTree.value.flatMap((group) => group.layouts) || []
);

const copyTargetLayout = ref<LayoutData | null>(null);
const showCopyDialog = ref(false);
const copyName = ref("");
const isExporting = ref(false);
const showExportErrorDialog = ref(false);
const exportErrorMessage = ref("");
const showImportDialog = ref(false);
const isImporting = ref(false);
const isImportDragOver = ref(false);

const folderIcons = {
  // PrimeVue v4 treats presence of expanded/collapsedIcon as custom toggle icons.
  // Leaving only the node icon avoids blank toggle buttons.
  icon: "mingcute:folder-line"
};

const treeValue = computed<TreeNode[]>(() => {
  const userNodes: TreeNode[] = userLayouts.value.length
    ? userLayouts.value.map((layout) => ({
        key: layout.id,
        label: layout.name,
        type: "layout",
        data: layout,
        icon: "mingcute:layout-grid-line",
        selectable: true
      }))
    : [
        {
          key: "custom-empty",
          label: "カスタムレイアウトがありません",
          selectable: false,
          icon: "mingcute:information-line"
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
      icon: "mingcute:monitor-line",
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

const previewCanvasStyle = computed(() => {
  return {
    width: `${(selectedLayout.value?.width ?? 0) + previewPadding * 2}px`,
    height: `${(selectedLayout.value?.height ?? 0) + previewPadding * 2}px`
  };
});

const previewPlacementStyle = computed(() => {
  return {
    left: `${previewPadding}px`,
    top: `${previewPadding}px`
  };
});

/**
 * Re-centers the scroll viewport on the selected layout preview.
 */
const centerSelectedLayoutPreview = async () => {
  await nextTick();

  const container = previewContainerRef.value;
  const preview = previewRef.value;

  if (!container || !preview) return;

  const scrollX =
    preview.offsetLeft + preview.offsetWidth / 2 - container.clientWidth / 2;
  const scrollY =
    preview.offsetTop + preview.offsetHeight / 2 - container.clientHeight / 2;

  container.scrollLeft = Math.max(0, scrollX);
  container.scrollTop = Math.max(0, scrollY);
};

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

  window.kemosikaApi.startVisualizer({
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

const isUserLayoutSelected = computed(
  () => selectedLayoutSource.value === "user" && !!selectedLayout.value
);

/**
 * Exports the selected user layout as a self-contained archive.
 */
const exportSelectedLayout = async () => {
  if (!selectedLayout.value || !isUserLayoutSelected.value) return;

  isExporting.value = true;
  exportErrorMessage.value = "";

  try {
    await store.saveLayout(selectedLayout.value.id);
    await window.kemosikaApi.exportLayout({
      layoutId: selectedLayout.value.id
    });
  } catch (error) {
    exportErrorMessage.value =
      error instanceof Error
        ? error.message
        : "レイアウトのエクスポートに失敗しました。";
    showExportErrorDialog.value = true;
  } finally {
    isExporting.value = false;
  }
};

/**
 * Returns whether a file name can be handled as a layout archive.
 */
const isImportArchiveFileName = (fileName: string): boolean => {
  const normalizedName = fileName.toLowerCase();
  return (
    normalizedName.endsWith(".kemosika-layout") ||
    normalizedName.endsWith(".zip")
  );
};

/**
 * Converts Electron IPC errors into concise toast details.
 */
const getImportErrorMessage = (error: unknown): string => {
  const message =
    error instanceof Error
      ? error.message
      : "レイアウトのインポートに失敗しました。";

  return message
    .replace(/^Error invoking remote method '[^']+': Error: /, "")
    .replace(/^Error: /, "");
};

/**
 * Shows an error toast for rejected import sources.
 */
const showImportErrorToast = (error: unknown) => {
  toast.add({
    severity: "error",
    summary: "インポートに失敗しました",
    detail: getImportErrorMessage(error),
    life: 6000
  });
};

/**
 * Refreshes the layout list and selects the imported layout.
 */
const finishLayoutImport = async (layoutId?: string) => {
  await store.init();
  if (layoutId) {
    navigateToLayout(layoutId);
  }
  showImportDialog.value = false;
};

/**
 * Runs an import action with shared progress and error handling.
 */
const runLayoutImport = async (
  importAction: () => ReturnType<typeof window.kemosikaApi.importLayoutFromPath>
) => {
  if (isImporting.value) return;

  isImporting.value = true;

  try {
    const result = await importAction();
    if (!result.canceled) {
      await finishLayoutImport(result.layoutId);
    }
  } catch (error) {
    showImportErrorToast(error);
  } finally {
    isImporting.value = false;
  }
};

/**
 * Opens the native folder picker and imports the selected directory.
 */
const selectImportDirectory = async () => {
  await runLayoutImport(() => window.kemosikaApi.selectLayoutImportDirectory());
};

/**
 * Imports a single dropped filesystem item.
 */
const importDroppedFile = async (file: File) => {
  const filePath = window.kemosikaApi.getPathForFile(file);

  if (filePath) {
    await runLayoutImport(() =>
      window.kemosikaApi.importLayoutFromPath({ path: filePath })
    );
    return;
  }

  if (!isImportArchiveFileName(file.name)) {
    showImportErrorToast(new Error("対応していないインポートファイルです。"));
    return;
  }

  const buffer = await file.arrayBuffer();
  await runLayoutImport(() =>
    window.kemosikaApi.importLayoutArchive({
      buffer,
      fileName: file.name
    })
  );
};

/**
 * Highlights the drop area while a supported import source is over it.
 */
const onImportDragOver = () => {
  isImportDragOver.value = true;
};

/**
 * Clears the import drop highlight.
 */
const onImportDragLeave = () => {
  isImportDragOver.value = false;
};

/**
 * Imports exactly one dropped folder or archive file.
 */
const onImportDrop = async (event: DragEvent) => {
  isImportDragOver.value = false;
  const files = Array.from(event.dataTransfer?.files ?? []);

  if (files.length !== 1) {
    showImportErrorToast(new Error("インポート元は 1 つだけ指定してください。"));
    return;
  }

  await importDroppedFile(files[0]);
};

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
    void centerSelectedLayoutPreview();
  },
  { immediate: true, flush: "post" }
);

onMounted(() => {
  void centerSelectedLayoutPreview();
});

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
      <main class="preview-container" ref="previewContainerRef">
        <div class="preview-canvas" :style="previewCanvasStyle">
          <div
            data-testid="layout-preview"
            class="preview kmsk-dotted-background"
            ref="previewRef"
            v-if="selectedLayout"
            :style="[layoutStyle, previewPlacementStyle]"
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
      </main>
      <FloatActions>
        <ButtonGroup>
          <Button
            class="float-action-button"
            data-testid="layout-edit-button"
            :disabled="!selectedLayout"
            @click="handleLeftAction"
            :aria-label="
              isBuiltinLayoutSelected ? 'Copy Layout' : 'Edit Layout'
            "
          >
            <Icon
              :icon="
                isBuiltinLayoutSelected
                  ? 'mingcute:copy-2-line'
                  : 'mingcute:edit-4-line'
              "
              class="action-icon"
            />
            <span class="action-label">{{
              isBuiltinLayoutSelected ? "コピー" : "編集"
            }}</span>
          </Button>
          <Button
            class="float-action-button"
            data-testid="layout-export-button"
            :disabled="!isUserLayoutSelected || isExporting"
            @click="exportSelectedLayout"
            aria-label="Export Layout"
          >
            <Icon icon="mingcute:download-2-line" class="action-icon" />
            <span class="action-label">エクスポート</span>
          </Button>
          <Button
            class="float-action-button type-primary"
            data-testid="visualizer-start-button"
            :disabled="!selectedLayout"
            @click="gotoVisualizer"
            aria-label="Open Visualizer"
          >
            <Icon icon="mingcute:play-fill" class="action-icon" />
            <span class="action-label">ビジュアライザー</span>
          </Button>
        </ButtonGroup>
      </FloatActions>
    </template>
    <template #aside>
      <aside class="list-column">
        <div class="aside-header">
          <Button
            class="nn-button primary"
            data-testid="layout-create-button"
            @click="addLayout"
            aria-label="新規作成"
            size="small"
          >
            <Icon icon="mingcute:file-new-line" class="nn-icon" />
            <span>新規作成</span>
          </Button>
          <Button
            class="nn-button"
            data-testid="layout-import-button"
            @click="showImportDialog = true"
            aria-label="インポート"
            size="small"
          >
            <Icon icon="mingcute:upload-line" class="nn-icon" />
            <span>インポート</span>
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
        >
          <template #nodeicon="{ node, class: iconClass }">
            <Icon v-if="node.icon" :icon="node.icon" :class="iconClass" />
          </template>
          <template #nodetoggleicon="{ expanded }">
            <Icon
              :icon="expanded ? 'mingcute:down-line' : 'mingcute:right-line'"
              class="p-tree-node-toggle-icon"
            />
          </template>
        </Tree>
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
        <template #closeicon="{ class: iconClass }">
          <Icon :class="iconClass" icon="mingcute:close-line" />
        </template>
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
      <Dialog
        v-model:visible="showImportDialog"
        modal
        :closable="true"
        :draggable="false"
        :baseZIndex="5000"
        appendTo="body"
        class="import-dialog"
        style="width: min(560px, calc(100vw - 48px))"
      >
        <template #closeicon="{ class: iconClass }">
          <Icon :class="iconClass" icon="mingcute:close-line" />
        </template>
        <template #header>
          <div class="import-dialog-header">
            <span class="import-dialog-title">レイアウトをインポート</span>
          </div>
        </template>
        <div
          class="import-drop-area"
          :class="{ 'is-dragover': isImportDragOver }"
          data-testid="layout-import-drop-area"
          @dragover.prevent="onImportDragOver"
          @dragleave.prevent="onImportDragLeave"
          @drop.prevent="onImportDrop"
        >
          <Icon icon="mingcute:upload-2-line" class="import-drop-icon" />
          <div class="import-drop-copy">
            <span class="import-drop-title"
              >フォルダまたはレイアウトファイルをドロップ</span
            >
            <span class="import-drop-description"
              >.kemosika-layout / .zip も受け付けます</span
            >
          </div>
        </div>
        <template #footer>
          <div class="import-dialog-actions">
            <Button
              label="キャンセル"
              severity="secondary"
              text
              :disabled="isImporting"
              @click="showImportDialog = false"
            />
            <Button
              data-testid="layout-import-select-folder-button"
              :loading="isImporting"
              :disabled="isImporting"
              @click="selectImportDirectory"
            >
              <Icon
                icon="mingcute:folder-open-line"
                class="p-button-icon p-button-icon-left"
              />
              <span>フォルダを選択</span>
            </Button>
          </div>
        </template>
      </Dialog>
      <Dialog
        v-model:visible="showExportErrorDialog"
        modal
        :closable="true"
        :draggable="false"
        :baseZIndex="5000"
        appendTo="body"
        class="export-error-dialog"
      >
        <template #closeicon="{ class: iconClass }">
          <Icon :class="iconClass" icon="mingcute:close-line" />
        </template>
        <template #header>
          <div class="export-error-dialog-header">
            <span class="export-error-dialog-title">エクスポートに失敗しました</span>
          </div>
        </template>
        <div class="export-error-dialog-body">
          {{ exportErrorMessage }}
        </div>
        <template #footer>
          <div class="export-error-dialog-actions">
            <Button label="閉じる" @click="showExportErrorDialog = false" />
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
  position: relative;
  overflow: scroll;
  background-color: #c9ccd2;
  overscroll-behavior: contain;
}

.preview-canvas {
  position: relative;
  min-width: 100%;
  min-height: 100%;
  background-color: #d0d3d8;
}

.preview {
  flex: 0 0 auto;
  position: absolute;
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.18);
}

.category-title {
  font-size: 20px;
  margin: 16px auto auto 0;
}

.aside-header {
  padding: 16px 16px 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  .nn-button {
    width: 100%;
    justify-content: center;
  }
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

.export-error-dialog {
  .export-error-dialog-body {
    max-width: 480px;
    padding: 8px 0 16px;
    color: var(--color-grey-500);
    line-height: 1.6;
  }

  .export-error-dialog-actions {
    display: flex;
    justify-content: flex-end;
  }
}

.import-dialog {
  .import-dialog-header {
    display: flex;
    align-items: center;
  }

  .import-dialog-title {
    font-weight: 700;
  }

  .import-drop-area {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 180px;
    padding: 24px;
    margin: 4px 0 16px;
    color: #eef1f3;
    background: #202225;
    border: 1px dashed rgba(255, 255, 255, 0.24);
    border-radius: 8px;
    transition:
      background-color 0.16s ease,
      border-color 0.16s ease;

    &.is-dragover {
      background-color: rgba(103, 199, 217, 0.12);
      border-color: #67c7d9;
    }
  }

  .import-drop-icon {
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    color: #67c7d9;
  }

  .import-drop-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .import-drop-title {
    font-weight: 700;
  }

  .import-drop-description {
    color: var(--color-grey-500);
    font-size: 13px;
  }

  .import-dialog-actions {
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
