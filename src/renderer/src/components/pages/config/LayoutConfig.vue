<script setup lang="ts">
import type { LayoutData } from "@shared/types";
import type { PropType } from "vue";

const props = defineProps({
  layout: Object as PropType<LayoutData>,
});

const emit = defineEmits(["change"]);

const onChangeInput = (key: string, value: any) => {
  switch (key) {
    case "name":
    case "width":
    case "height":
      emit("change", {
        ...props.layout,
        [key]: value,
      });
      break;
  }
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
        v-model="props.layout.name"
        @update:modelValue="onChangeInput('name', $event)"
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
        v-model="props.layout.width"
        @update:modelValue="onChangeInput('width', $event)"
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
        v-model="props.layout.height"
        @update:modelValue="onChangeInput('height', $event)"
      >
        <template #prefix>
          <span>H</span>
        </template>
      </ElInputNumber>
    </div>
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
</style>
