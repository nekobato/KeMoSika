<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { LayoutData } from "@shared/types";

const props = defineProps<{
  layout?: LayoutData;
}>();

const emit = defineEmits<{
  change: [layout: LayoutData];
  openImageDialog: [];
}>();

const updateLayoutValue = (
  key: "name" | "width" | "height",
  value: string | number | undefined,
): void => {
  if (!props.layout || value === undefined) return;

  emit("change", {
    ...props.layout,
    [key]: value,
  });
};

const updateBackgroundColor = (color: string | null): void => {
  if (!props.layout || !color) return;

  emit("change", {
    ...props.layout,
    background: {
      ...props.layout.background,
      color,
    },
  });
};

const clearBackgroundImage = (): void => {
  if (!props.layout) return;

  emit("change", {
    ...props.layout,
    background: {
      ...props.layout.background,
      image: "",
    },
  });
};
</script>
<template>
  <section class="layout-config" v-if="props.layout">
    <div class="form grid">
      <ElInput
        class="grid-span-2"
        id="layout-name"
        size="small"
        placeholder="レイアウト名"
        :model-value="props.layout.name"
        @update:model-value="updateLayoutValue('name', $event)"
      >
        <template #prefix>
          <span>名</span>
        </template>
      </ElInput>
      <ElInputNumber
        id="layout-w"
        class="field-control"
        size="small"
        :controls="false"
        :min="40"
        :max="9999"
        :step="1"
        :model-value="props.layout.width"
        @update:model-value="updateLayoutValue('width', $event)"
      >
        <template #prefix>
          <span>W</span>
        </template>
      </ElInputNumber>
      <ElInputNumber
        id="layout-h"
        class="field-control"
        size="small"
        :controls="false"
        :min="40"
        :max="9999"
        :step="1"
        :model-value="props.layout.height"
        @update:model-value="updateLayoutValue('height', $event)"
      >
        <template #prefix>
          <span>H</span>
        </template>
      </ElInputNumber>
    </div>

    <ElDivider />

    <div class="section-title">背景</div>
    <div class="background-color-field">
      <ElColorPicker
        id="layout-background-color"
        :model-value="props.layout.background.color"
        @update:model-value="updateBackgroundColor"
      />
      <label for="layout-background-color">背景色</label>
      <code>{{ props.layout.background.color }}</code>
    </div>

    <button
      class="background-image-preview"
      type="button"
      aria-label="背景画像を選択"
      @click="emit('openImageDialog')"
    >
      <img
        v-if="props.layout.background.image"
        :src="`media://images/${props.layout.background.image}.png`"
        alt=""
      />
      <span v-else class="background-image-placeholder">
        <Icon icon="mingcute:add-line" aria-hidden="true" />
        <span>背景画像を選択</span>
      </span>
    </button>

    <div class="background-image-actions">
      <ElButton size="small" @click="emit('openImageDialog')">
        <Icon icon="mingcute:pic-line" aria-hidden="true" />
        <span>画像を選択</span>
      </ElButton>
      <ElButton
        v-if="props.layout.background.image"
        size="small"
        plain
        @click="clearBackgroundImage"
      >
        <Icon icon="mingcute:close-line" aria-hidden="true" />
        <span>割り当てを解除</span>
      </ElButton>
    </div>
    <p class="background-hint">
      画像は背景色の上に、レイアウト全体へ合わせて伸縮表示されます。
    </p>
  </section>
</template>

<style scoped lang="scss">
.layout-config {
  padding: 20px;
  color: #eef1f3;
}
.form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  &.grid {
    .grid-span-2 {
      grid-column: 1 / -1;
    }
  }
}
.field-control {
  width: 100%;
}
.section-title {
  margin-bottom: 12px;
  color: #dfe5ea;
  font-size: 12px;
  font-weight: 700;
}
.background-color-field {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  label {
    color: #cbd3da;
    font-size: 12px;
  }

  code {
    color: #aeb6bd;
    font-size: 11px;
  }
}
.background-image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 112px;
  padding: 0;
  overflow: hidden;
  color: #aeb6bd;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.22);
  border-radius: 6px;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    border-color: #67c7d9;
  }

  &:focus-visible {
    outline: 2px solid #67c7d9;
    outline-offset: 2px;
  }

  img {
    width: 100%;
    height: 112px;
    object-fit: fill;
  }
}
.background-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;

  > svg {
    font-size: 24px;
  }
}
.background-image-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;

  :deep(.el-button > span) {
    gap: 6px;
  }
}
.background-hint {
  margin: 10px 0 0;
  color: #aeb6bd;
  font-size: 12px;
  line-height: 1.5;
}
</style>
