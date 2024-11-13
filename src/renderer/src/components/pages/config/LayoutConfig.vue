<script setup lang="ts">
import { LayoutData } from "@shared/types";
import * as EP from "element-plus";
import { PropType } from "vue";

const props = defineProps({
  layout: Object as PropType<LayoutData>
});

const emit = defineEmits(["change"]);

const onChangeInput = (key: string, value: any) => {
  console.log(key, value);
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
  <section class="keyboard-key-config" v-if="props.layout">
    <EP.ElForm class="form" label-width="auto">
      <EP.ElRow>
        <EP.ElFormItem label="レイアウト名">
          <EP.ElInput
            class="name"
            placeholder="おなまえ"
            v-model="props.layout.name"
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
              v-model="props.layout.width"
              :min="40"
              :max="9999"
              :step="1"
              :controls="false"
              placeholder="ヨコ"
              @change="onChangeInput('width', $event)"
            />
          </EP.ElFormItem>
        </EP.ElCol>
        <EP.ElCol :span="12">
          <EP.ElFormItem label="H">
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="props.layout.height"
              :min="40"
              :max="9999"
              :step="1"
              :controls="false"
              placeholder="タテ"
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
  padding: 16px;
}
.form {
  width: 100%;

  .name {
    width: 222px;
  }
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
  width: 100px;
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
