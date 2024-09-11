<script setup lang="ts">
import { LayoutData } from "@shared/types";
import * as EP from "element-plus";
import { PropType } from "vue";

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
  <section class="keyboard-key-config" v-if="layout">
    <EP.ElForm class="form" :model="layout" label-width="auto">
      <EP.ElRow>
        <EP.ElFormItem label="Layout Name">
          <EP.ElInput
            v-model="layout.name"
            size="small"
            placeholder="Layout Name"
            @change="onChangeInput('name', $event)"
          />
        </EP.ElFormItem>
      </EP.ElRow>
      <EP.ElRow>
        <EP.ElCol :span="12">
          <EP.ElFormItem label="W">
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="layout.width"
              :min="0"
              :max="999999"
              :step="1"
              :controls="false"
              @change="onChangeInput('width', $event)"
            />
          </EP.ElFormItem>
        </EP.ElCol>
        <EP.ElCol :span="12">
          <EP.ElFormItem label="H">
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="layout.height"
              :min="0"
              :max="999999"
              :step="1"
              :controls="false"
              @change="onChangeInput('height', $event)"
            />
          </EP.ElFormItem>
        </EP.ElCol>
      </EP.ElRow>
    </EP.ElForm>
  </section>
</template>

<style scoped lang="scss">
.keyboard-key-config {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  min-width: 320px;
  background-color: #252525;
  overflow-y: scroll;
  padding: 16px;
}
.form {
  width: 100%;
}
.keymap-group {
  padding: 0 0 16px;
}
.row {
  &.image-upload {
    margin-top: 8px;
    height: 120px;
  }
}
.input-key {
  width: 64px;
  ::v-deep(input) {
    text-align: center;
  }
}
.input-bounds {
  width: 64px;
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
</style>
