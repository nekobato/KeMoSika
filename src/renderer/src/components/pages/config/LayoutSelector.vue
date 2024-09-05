<script setup lang="ts">
import { LayoutData } from "@shared/types";
import { computed, PropType } from "vue";
import { Icon } from "@iconify/vue";
import { ElSelect } from "element-plus";

const props = defineProps({
  layouts: Array as PropType<LayoutData[]>,
  activeLayoutIndex: Number
});

const emit = defineEmits(["change"]);

const options = computed(() => {
  return props.layouts.map((layout, index) => ({
    key: index,
    label: layout.name,
    value: index
  }));
});

const onChange = (value: number) => {
  emit("change", value);
};
</script>

<template>
  <ElSelect
    class="layout-selector"
    size="large"
    :model-value="props.activeLayoutIndex"
    @change="onChange"
  >
    <template #label="{ label }">
      <div class="label">
        <Icon class="icon" icon="mingcute:keyboard-fill" />
        <span class="label">{{ label }}</span>
      </div>
    </template>
    <ElOption
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </ElSelect>
</template>

<style scoped lang="scss">
.icon {
  color: #d7ba8f;
  margin-right: 8px;
  width: 20px;
  height: 20px;
}
.layout-selector {
  width: 240px;
  height: 40px;
  background-color: var(--dot-bg);
  cursor: pointer;
  .label {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 20px;
    color: #d7ba8f;
    filter: drop-shadow(4px 2px 0 #77777777);
  }
}
</style>
