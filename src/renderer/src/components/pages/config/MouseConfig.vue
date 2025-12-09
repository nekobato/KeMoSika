<script setup lang="ts">
import { PropType } from "vue";
import { Icon } from "@iconify/vue";
import { MouseData } from "@shared/types";
import { MouseImageType } from "@/types/app";
import InputNumber from "primevue/inputnumber";
import Divider from "primevue/divider";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";

const props = defineProps({
  mouseData: {
    type: Object as PropType<MouseData>,
    required: true
  }
});

const emit = defineEmits(["change", "openImageDialog"]);
const imageTypes: { key: MouseImageType; label: string }[] = [
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
    <div class="form grid">
      <IconField>
        <InputIcon><span>X</span></InputIcon>
        <InputNumber
          inputId="mouse-x"
          size="small"
          fluid
          v-model="mouseData.x"
          :useGrouping="false"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('x', $event)"
        />
      </IconField>
      <IconField>
        <InputIcon><span>Y</span></InputIcon>
        <InputNumber
          inputId="mouse-y"
          size="small"
          fluid
          v-model="mouseData.y"
          :useGrouping="false"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('y', $event)"
        />
      </IconField>

      <IconField>
        <InputIcon><span>W</span></InputIcon>
        <InputNumber
          inputId="mouse-w"
          size="small"
          fluid
          v-model="mouseData.width"
          :useGrouping="false"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('width', $event)"
        />
      </IconField>
      <IconField>
        <InputIcon><span>H</span></InputIcon>
        <InputNumber
          inputId="mouse-h"
          size="small"
          fluid
          v-model="mouseData.height"
          :useGrouping="false"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('height', $event)"
        />
      </IconField>

      <IconField class="grid-span-2">
        <InputIcon
          ><Icon icon="mingcute:clockwise-line" class="icon"
        /></InputIcon>
        <InputNumber
          inputId="mouse-rotation"
          size="small"
          fluid
          v-model="mouseData.rotation"
          :useGrouping="false"
          :min="-999999"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('rotation', $event)"
        />
      </IconField>

      <Divider class="grid-span-2" />

      <div class="section-title grid-span-2">マウス画像</div>
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
  </section>
</template>

<style scoped lang="scss">
.mouse-config {
  padding: 16px;
}
.grid {
  margin: 0;
}
.form {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  .grid-span-2 {
    grid-column: 1 / -1;
  }
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
