<script setup lang="ts">
import { PropType } from "vue";
import { Icon } from "@iconify/vue";
import { MouseData } from "@shared/types";
import { MouseImageType } from "@/types/app";
import InputNumber from "primevue/inputnumber";
import Divider from "primevue/divider";

const props = defineProps({
  mouseData: {
    type: Object as PropType<MouseData>,
    required: true
  }
});

const emit = defineEmits(["change", "openImageDialog"]);
const imageTypes = [
  { key: "mouseDefault", label: "デフォルト" },
  { key: "mouseLeftClick", label: "左クリック" },
  { key: "mouseRightClick", label: "右クリック" },
  { key: "mouseMiddleClick", label: "中クリック" },
  { key: "mouseScrollUp", label: "スクロールアップ" },
  { key: "mouseScrollDown", label: "スクロールダウン" }
];

const onChangeInput = (key: string, value: any) => {
  switch (key) {
    case "x":
    case "y":
    case "width":
    case "height":
    case "rotation":
      emit("change", {
        ...props.mouseData,
        [key]: value
      });
      break;
  }
};

const selectImage = (type: MouseImageType) => {
  emit("openImageDialog", type);
};
</script>

<template>
  <section class="mouse-config" v-if="mouseData">
    <div class="form">
      <div class="field-grid">
        <div class="field">
          <label for="mouse-x">X</label>
          <InputNumber
            inputId="mouse-x"
            class="input-bounds"
            v-model="mouseData.x"
            :useGrouping="false"
            :min="0"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('x', $event)"
          />
        </div>
        <div class="field">
          <label for="mouse-y">Y</label>
          <InputNumber
            inputId="mouse-y"
            class="input-bounds"
            v-model="mouseData.y"
            :useGrouping="false"
            :min="0"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('y', $event)"
          />
        </div>
      </div>

      <div class="field-grid">
        <div class="field">
          <label for="mouse-w">W</label>
          <InputNumber
            inputId="mouse-w"
            class="input-bounds"
            v-model="mouseData.width"
            :useGrouping="false"
            :min="0"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('width', $event)"
          />
        </div>
        <div class="field">
          <label for="mouse-h">H</label>
          <InputNumber
            inputId="mouse-h"
            class="input-bounds"
            v-model="mouseData.height"
            :useGrouping="false"
            :min="0"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('height', $event)"
          />
        </div>
      </div>

      <div class="field-grid single">
        <div class="field">
          <label class="icon-label" for="mouse-rotation">
            <Icon icon="mingcute:clockwise-line" class="icon" />
          </label>
          <InputNumber
            inputId="mouse-rotation"
            class="input-bounds"
            v-model="mouseData.rotation"
            :useGrouping="false"
            :min="-999999"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('rotation', $event)"
          />
        </div>
      </div>

      <Divider />

      <div class="section-title">マウス画像</div>
      <div class="image-grid">
        <div class="image-cell" v-for="type in imageTypes" :key="type.key">
          <img
            class="mouse-image"
            v-if="mouseData.images[type.key]"
            :src="`media://images/${mouseData.images[type.key]}.png`"
            @click="selectImage(type.key as MouseImageType)"
          />
          <div
            class="mouse-image-placeholder"
            v-else
            @click="selectImage(type.key as MouseImageType)"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>{{ type.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.mouse-config {
  padding: 16px;
}
.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  &.single {
    grid-template-columns: 1fr;
  }
}
.field {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    min-width: 32px;
    color: #4c4d4f;
  }

  .icon-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
  }
}
.input-bounds {
  width: 80px;
}
.section-title {
  margin-bottom: 8px;
  font-size: 14px;
  color: #4c4d4f;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.image-cell {
  min-height: 100px;
}
.mouse-image {
  width: 100%;
  height: 100px;
  object-fit: contain;
  cursor: pointer;
  border: 1px solid #333;
  border-radius: 4px;

  &:hover {
    border: 1px solid #409eff;
  }
}
.mouse-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px dashed #4c4d4f;
  border-radius: 4px;

  &:hover {
    border: 1px dashed #409eff;
  }

  .icon {
    font-size: 24px;
    color: #4c4d4f;
  }

  span {
    margin-top: 4px;
    font-size: 12px;
    color: #4c4d4f;
  }
}
</style>
