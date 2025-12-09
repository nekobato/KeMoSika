<script setup lang="ts">
import { LayoutData } from "@shared/types";
import { PropType } from "vue";
import IconField from "primevue/iconfield";
import InputText from "primevue/inputtext";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";

const props = defineProps({
  layout: Object as PropType<LayoutData>
});

const emit = defineEmits(["change"]);

const onChangeInput = (key: string, value: any) => {
  switch (key) {
    case "name":
    case "width":
    case "height":
      emit("change", {
        ...props.layout,
        [key]: value
      });
      break;
  }
};
</script>
<template>
  <section class="layout-config" v-if="props.layout">
    <div class="form grid">
      <IconField class="grid-span-2">
        <InputIcon>
          <span>名</span>
        </InputIcon>
        <InputText
          id="layout-name"
          size="small"
          placeholder="レイアウト名"
          fluid
          v-model="props.layout.name"
          @update:modelValue="onChangeInput('name', $event)"
        />
      </IconField>
      <IconField>
        <InputIcon>
          <span>W</span>
        </InputIcon>
        <InputNumber
          inputId="layout-w"
          class="input-bounds"
          size="small"
          fluid
          :useGrouping="false"
          :min="40"
          :max="9999"
          :step="1"
          v-model="props.layout.width"
          @update:modelValue="onChangeInput('width', $event)"
        />
      </IconField>
      <IconField>
        <InputIcon>
          <span>H</span>
        </InputIcon>
        <InputNumber
          inputId="layout-h"
          class="input-bounds"
          size="small"
          fluid
          :useGrouping="false"
          :min="40"
          :max="9999"
          :step="1"
          v-model="props.layout.height"
          @update:modelValue="onChangeInput('height', $event)"
        />
      </IconField>
    </div>
  </section>
</template>

<style scoped lang="scss">
.layout-config {
  padding: 24px;
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
</style>
