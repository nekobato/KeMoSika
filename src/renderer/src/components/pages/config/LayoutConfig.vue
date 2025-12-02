<script setup lang="ts">
import { LayoutData } from "@shared/types";
import { PropType } from "vue";
import InputText from "primevue/inputtext";
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
    <div class="form">
      <div class="field">
        <label for="layout-name">名</label>
        <InputText
          id="layout-name"
          class="name"
          placeholder="おなまえ"
          v-model="props.layout.name"
          @update:modelValue="onChangeInput('name', $event)"
        />
      </div>
      <div class="field-grid">
        <div class="field">
          <label for="layout-w">W</label>
          <InputNumber
            inputId="layout-w"
            class="input-bounds"
            :useGrouping="false"
            :min="40"
            :max="9999"
            :step="1"
            v-model="props.layout.width"
            @update:modelValue="onChangeInput('width', $event)"
          />
        </div>
        <div class="field">
          <label for="layout-h">H</label>
          <InputNumber
            inputId="layout-h"
            class="input-bounds"
            :useGrouping="false"
            :min="40"
            :max="9999"
            :step="1"
            v-model="props.layout.height"
            @update:modelValue="onChangeInput('height', $event)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.layout-config {
  padding: 16px;
}
.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .name {
    width: 180px;
  }
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.field {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    min-width: 28px;
    color: #4c4d4f;
  }
}
.input-bounds {
  width: 80px;
}
</style>
