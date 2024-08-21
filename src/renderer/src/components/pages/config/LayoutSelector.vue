<script setup lang="ts">
import { LayoutData } from "@shared/types";
import { computed, PropType } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps({
  layouts: Array as PropType<LayoutData[]>,
  activeLayoutIndex: Number
});

const emit = defineEmits(["change"]);

const options = computed(() => {
  return props.layouts.map((layout, index) => ({
    label: layout.name,
    value: index
  }));
});

const onChange = (value: number) => {
  emit("change", value);
};
</script>

<template>
  <div class="container">
    <Icon class="icon" icon="mingcute:keyboard-fill" />
    <ElSelect
      class="layout-selector"
      size="large"
      v-model="props.activeLayoutIndex"
      @change="onChange"
    >
      <template #label="{ label }">
        <span class="label">{{ label }}</span>
      </template>
      <ElOption
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </ElSelect>
  </div>
</template>

<style scoped lang="scss">
.icon {
  color: #d7ba8f;
  margin-right: 8px;
  width: 20px;
  height: 20px;
}
.layout-selector {
  .label {
    font-weight: bold;
    font-size: 20px;
    color: #d7ba8f;
    filter: drop-shadow(4px 2px 0 #77777777);
  }
}
</style>
