<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from "vue";
import type { PropType } from "vue";
import { Icon } from "@iconify/vue";
import { keyboardEventToInputCode } from "@/utils/key";
import type { KeyboardKeyData, KeyActivationMode } from "@shared/types";
import type { InputImageType } from "@/types/app";
import KeyActivationCondition from "./KeyActivationCondition.vue";

const props = defineProps({
  keyData: {
    type: Object as PropType<KeyboardKeyData>,
    required: true,
  },
});

const emit = defineEmits<{
  change: [keyData: KeyboardKeyData];
  openImageDialog: [type: InputImageType];
}>();

const systemFonts = ref<string[]>([]);
const fontLoadError = ref<string | null>(null);
const isFontLoading = ref(false);
const configRoot = useTemplateRef<HTMLElement>("config-root");

/**
 * Fetch system font list from the main process and cache it locally.
 */
const loadSystemFonts = async () => {
  if (systemFonts.value.length > 0 || isFontLoading.value) return;

  isFontLoading.value = true;
  fontLoadError.value = null;

  try {
    const fonts = await window.kemosikaApi.listFonts();
    systemFonts.value = Array.isArray(fonts) ? fonts : [];
  } catch (error) {
    console.error("font:list failed", error);
    fontLoadError.value = "failed";
    systemFonts.value = [];
  } finally {
    isFontLoading.value = false;
  }
};

onMounted(() => {
  void loadSystemFonts();
});

const updateCodeMap = (codeMap: string[]): void => {
  emit("change", {
    ...props.keyData,
    codeMap,
  });
};

const onKeyDownShortcutInput = (e: KeyboardEvent, index: number): void => {
  e.preventDefault();
  const targetCodeMap = props.keyData.codeMap[index];
  const shortcut = keyboardEventToInputCode(e);

  if (
    shortcut === "" ||
    (shortcut !== targetCodeMap && props.keyData.codeMap.includes(shortcut))
  ) {
    return;
  }

  updateCodeMap(
    props.keyData.codeMap.map((code, i) =>
      i === index ? shortcut : code,
    ),
  );
};

const addCodeMap = async (): Promise<void> => {
  const newIndex = props.keyData.codeMap.length;
  updateCodeMap([...props.keyData.codeMap, ""]);
  await nextTick();
  configRoot.value
    ?.querySelector<HTMLElement>(`[data-keymap-index="${newIndex}"]`)
    ?.focus();
};

const removeCodeMap = (index: number): void => {
  updateCodeMap(props.keyData.codeMap.filter((_, i) => i !== index));
};

const onChangeInput = (key: string, value: any) => {
  switch (key) {
    case "x":
    case "y":
    case "width":
    case "height":
    case "rotation":
    case "shadow":
      emit("change", {
        ...props.keyData,
        [key]: value,
      });
      break;
    case "text.isVisible":
    case "text.character":
    case "text.x":
    case "text.y":
    case "text.size":
    case "text.color":
    case "text.font": {
      if (!props.keyData.text) return;

      emit("change", {
        ...props.keyData,
        text: {
          ...props.keyData.text,
          [key.split(".")[1]]: value,
        },
      });
      break;
    }
  }
};

const onChangeActivationMode = (activationMode: KeyActivationMode): void => {
  emit("change", {
    ...props.keyData,
    activationMode,
  });
};

const selectImage = (type: InputImageType) => {
  emit("openImageDialog", type);
};
</script>

<template>
  <section ref="config-root" class="keyboard-key-config" v-if="keyData">
    <div class="form">
      <div class="grid">
        <div class="keymap-group grid-span-2">
          <ElTag
            v-for="(mapKey, index) in keyData.codeMap"
            :key="`${mapKey}-${index}`"
            :data-keymap-index="index"
            class="keymap"
            size="small"
            closable
            @close="removeCodeMap(index)"
            @keydown="onKeyDownShortcutInput($event, index)"
            tabindex="0"
          >
            {{ mapKey || "Empty" }}
          </ElTag>
          <ElButton
            class="keymap add-button"
            size="small"
            plain
            @click="addCodeMap"
          >
            <Icon class="icon" icon="mingcute:add-line" />Add
          </ElButton>
        </div>

        <KeyActivationCondition
          class="grid-span-2"
          :model-value="keyData.activationMode ?? 'any'"
          @update:model-value="onChangeActivationMode"
        />

        <ElInputNumber
          id="key-x"
          class="field-control"
          size="small"
          :controls="false"
          v-model="keyData.x"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('x', $event)"
        >
          <template #prefix><span>X</span></template>
        </ElInputNumber>

        <ElInputNumber
          id="key-y"
          class="field-control"
          size="small"
          :controls="false"
          v-model="keyData.y"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('y', $event)"
        >
          <template #prefix><span>Y</span></template>
        </ElInputNumber>

        <ElInputNumber
          id="key-w"
          class="field-control"
          size="small"
          :controls="false"
          v-model="keyData.width"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('width', $event)"
        >
          <template #prefix><span>W</span></template>
        </ElInputNumber>

        <ElInputNumber
          id="key-h"
          class="field-control"
          size="small"
          :controls="false"
          v-model="keyData.height"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('height', $event)"
        >
          <template #prefix><span>H</span></template>
        </ElInputNumber>

        <ElInputNumber
          id="key-rotation"
          class="field-control"
          size="small"
          :controls="false"
          v-model="keyData.rotation"
          :min="-999999"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('rotation', $event)"
        >
          <template #prefix>
            <Icon icon="mingcute:clockwise-line" class="icon" />
          </template>
        </ElInputNumber>

        <div />
      </div>

      <div class="checkbox-field">
        <ElSwitch
          id="key-shadow"
          size="small"
          v-model="keyData.shadow"
          @update:modelValue="onChangeInput('shadow', $event)"
        />
        <label for="key-shadow">影を付ける</label>
      </div>

      <ElDivider />

      <div class="checkbox-field" v-if="keyData.text">
        <ElSwitch
          id="key-text-visible"
          size="small"
          v-model="keyData.text.isVisible"
          @update:modelValue="onChangeInput('text.isVisible', $event)"
        />
        <label for="key-text-visible">Text</label>
      </div>

      <div class="grid" v-if="keyData.text?.isVisible">
        <ElInput
          id="key-text"
          size="small"
          v-model="keyData.text.character"
          @update:modelValue="onChangeInput('text.character', $event)"
        >
          <template #prefix>
            <Icon icon="mingcute:text-2-line" />
          </template>
        </ElInput>

        <div class="color-picker-field">
          <ElColorPicker
            id="key-text-color"
            class="color-input"
            v-model="keyData.text.color"
            @update:modelValue="onChangeInput('text.color', $event)"
          />
          <span>Color</span>
        </div>

        <ElInputNumber
          id="key-text-x"
          class="field-control"
          size="small"
          :controls="false"
          v-model="keyData.text.x"
          :min="-9999"
          :max="9999"
          :step="1"
          @update:modelValue="onChangeInput('text.x', $event)"
        >
          <template #prefix><span>X</span></template>
        </ElInputNumber>
        <ElInputNumber
          id="key-text-y"
          class="field-control"
          size="small"
          :controls="false"
          v-model="keyData.text.y"
          :min="-9999"
          :max="9999"
          :step="1"
          @update:modelValue="onChangeInput('text.y', $event)"
        >
          <template #prefix><span>Y</span></template>
        </ElInputNumber>

        <ElInputNumber
          id="key-text-size"
          class="field-control"
          size="small"
          :controls="false"
          v-model="keyData.text.size"
          :min="10"
          :max="99"
          :step="1"
          @update:modelValue="onChangeInput('text.size', $event)"
        >
          <template #prefix>
            <Icon icon="mingcute:font-size-line" />
          </template>
        </ElInputNumber>

        <div class="field-with-prefix grid-span-2">
          <span class="field-prefix">F</span>
          <ElSelect
            id="key-text-font"
            class="field-control"
            size="small"
            filterable
            allow-create
            clearable
            default-first-option
            :loading="isFontLoading"
            v-model="keyData.text.font"
            @update:modelValue="onChangeInput('text.font', $event)"
            placeholder="Font family"
          >
            <ElOption
              v-for="font in systemFonts"
              :key="font"
              :label="font"
              :value="font"
            />
          </ElSelect>
        </div>
        <div class="grid-span-2 font-hint" v-if="fontLoadError">
          フォント一覧を取得できませんでした
        </div>
      </div>
    </div>

    <ElDivider />

    <div class="section-title">キーボード画像</div>
    <div class="image-grid">
      <div class="image-cell">
        <img
          class="key-image"
          v-if="keyData.images.keyDefault"
          :src="`media://images/${keyData.images.keyDefault}.png`"
          @click="selectImage('keyDefault')"
        />
        <div
          class="key-image-placeholder"
          v-else
          @click="selectImage('keyDefault')"
        >
          <Icon class="icon" icon="mingcute:add-line" />
          <span>デフォルト</span>
        </div>
      </div>
      <div class="image-cell">
        <img
          class="key-image"
          v-if="keyData.images.keyActive"
          :src="`media://images/${keyData.images.keyActive}.png`"
          @click="selectImage('keyActive')"
        />
        <div
          class="key-image-placeholder"
          v-else
          @click="selectImage('keyActive')"
        >
          <Icon class="icon" icon="mingcute:add-line" />
          <span>アクティブ</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.keyboard-key-config {
  padding: 16px 20px 20px;
  color: #eef1f3;
}
.form {
  width: 100%;
}
.keymap-group {
  padding: 0 0 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.input-key {
  width: 64px;
  ::v-deep(input) {
    text-align: center;
  }
}
.input-bounds {
  flex: 0 0 auto;
  width: 64px;
}
.keymap {
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #67c7d9;
    outline-offset: 2px;
  }
}
.add-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.formitem {
  &.rotation {
    .icon {
      margin: auto;
      width: 20px;
      height: 20px;
    }
  }
}
.section-title {
  margin-bottom: 8px;
  color: #dfe5ea;
  font-size: 12px;
  font-weight: 700;
}
.grid {
  margin: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  .grid-span-2 {
    grid-column: 1 / -1;
  }
}
.field-control {
  width: 100%;
}
.field-with-prefix {
  display: flex;
  align-items: stretch;
}
.field-prefix {
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-right: 0;
  border-radius: var(--el-border-radius-base) 0 0 var(--el-border-radius-base);
}
.field-with-prefix :deep(.el-select__wrapper) {
  border-radius: 0 var(--el-border-radius-base) var(--el-border-radius-base) 0;
}
.checkbox-field {
  padding-bottom: 12px;
}
.checkbox-field,
.color-picker-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  label,
  span {
    color: #cbd3da;
    font-size: 12px;
  }
}
.font-hint {
  font-size: 12px;
  color: #aeb6bd;
}
.key-image {
  width: 100%;
  height: 100px;
  object-fit: contain;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 6px;

  &:hover {
    border-color: #67c7d9;
  }
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}
.image-cell {
  min-height: 100px;
}
.key-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #aeb6bd;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.22);
  border-radius: 6px;

  &:hover {
    background: rgba(103, 199, 217, 0.08);
    border-color: #67c7d9;
  }

  .icon {
    font-size: 24px;
    color: #aeb6bd;
  }

  span {
    margin-top: 4px;
    font-size: 12px;
    color: #cbd3da;
  }
}
</style>
