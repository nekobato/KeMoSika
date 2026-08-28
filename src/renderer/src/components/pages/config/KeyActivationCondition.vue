<script setup lang="ts">
import { computed } from "vue";
import type { KeyActivationMode } from "@shared/types";

const { modelValue } = defineProps<{
  modelValue: KeyActivationMode;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: KeyActivationMode];
}>();

const description = computed(() =>
  modelValue === "all"
    ? "登録したキーをすべて同時に押すと反応します。"
    : "登録したキーのどれか1つを押すと反応します。"
);

const onChange = (value: string | number | boolean): void => {
  if (value === "any" || value === "all") {
    emit("update:modelValue", value);
  }
};
</script>

<template>
  <fieldset class="activation-field">
    <legend id="key-activation-label" class="field-label">反応条件</legend>
    <ElRadioGroup
      class="mode-selector"
      :model-value="modelValue"
      size="small"
      aria-labelledby="key-activation-label"
      aria-describedby="key-activation-description"
      @change="onChange"
    >
      <ElRadioButton value="any">いずれか（OR）</ElRadioButton>
      <ElRadioButton value="all">すべて同時（AND）</ElRadioButton>
    </ElRadioGroup>
    <p id="key-activation-description" class="field-description">
      {{ description }}
    </p>
  </fieldset>
</template>

<style scoped lang="scss">
.activation-field {
  min-inline-size: 0;
  margin: 0;
  padding: 0 0 4px;
  border: 0;
}

.field-label {
  margin-bottom: 8px;
  padding: 0;
  color: #dfe5ea;
  font-size: 12px;
  font-weight: 700;
}

.mode-selector {
  display: flex;
  width: 100%;

  :deep(.el-radio-button) {
    flex: 1;
  }

  :deep(.el-radio-button__inner) {
    width: 100%;
  }
}

.field-description {
  margin: 8px 0 0;
  color: #aeb6bd;
  font-size: 12px;
  line-height: 1.5;
}
</style>
