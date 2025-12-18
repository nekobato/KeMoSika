<script setup lang="ts">
import { PropType } from "vue";
import { Icon } from "@iconify/vue";
import { MouseData } from "@shared/types";
import {
  MouseBodyImageType,
  MouseImageType,
  MouseOverlayImageType,
  MouseRingImageType
} from "@/types/app";
import InputNumber from "primevue/inputnumber";
import Divider from "primevue/divider";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import ColorPicker from "primevue/colorpicker";
import ToggleSwitch from "primevue/toggleswitch";

const props = defineProps({
  mouseData: {
    type: Object as PropType<MouseData>,
    required: true
  }
});

const emit = defineEmits(["change", "openImageDialog"]);
const imageTypes: { key: MouseBodyImageType; label: string }[] = [
  { key: "mouseDefault", label: "本体（静的）" },
  { key: "mouseLeftClick", label: "レガシー：左クリック本体" },
  { key: "mouseRightClick", label: "レガシー：右クリック本体" },
  { key: "mouseMiddleClick", label: "レガシー：中クリック本体" },
  { key: "mouseScrollUp", label: "レガシー：スクロールアップ本体" },
  { key: "mouseScrollDown", label: "レガシー：スクロールダウン本体" }
];
const ringImageTypes: { key: MouseRingImageType; label: string }[] = [
  { key: "ring", label: "リング画像" },
  { key: "pointer", label: "ポインタ画像" }
];
const overlayImageTypes: { key: MouseOverlayImageType; label: string }[] = [
  { key: "leftDefault", label: "左ボタン・未押下" },
  { key: "leftActive", label: "左ボタン・押下" },
  { key: "rightDefault", label: "右ボタン・未押下" },
  { key: "rightActive", label: "右ボタン・押下" },
  { key: "middleDefault", label: "中ボタン・未押下" },
  { key: "middleActive", label: "中ボタン・押下" }
];

const onChangeInput = (key: string, value: any) => {
  switch (key) {
    case "x":
    case "y":
    case "width":
    case "height":
    case "rotation":
    case "shadow":
      emit("change", {
        ...props.mouseData,
        [key]: value
      });
      break;
    case "ring.size":
    case "ring.color":
      emit("change", {
        ...props.mouseData,
        ring: {
          ...props.mouseData.ring,
          [key.split(".")[1]]: value
        }
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

      <div class="checkbox-field grid-span-2">
        <ToggleSwitch
          inputId="mouse-shadow"
          size="small"
          binary
          v-model="mouseData.shadow"
          @update:modelValue="onChangeInput('shadow', $event)"
        />
        <label for="mouse-shadow">影を付ける</label>
      </div>

      <IconField class="grid-span-2">
        <InputIcon><span>D</span></InputIcon>
        <InputNumber
          inputId="mouse-ring-size"
          size="small"
          fluid
          v-model="mouseData.ring.size"
          :useGrouping="false"
          :min="0"
          :max="999999"
          :step="1"
          @update:modelValue="onChangeInput('ring.size', $event)"
        />
      </IconField>

      <div class="color-picker-field grid-span-2">
        <ColorPicker
          inputId="mouse-ring-color"
          class="color-input"
          v-model="mouseData.ring.color"
          @update:modelValue="onChangeInput('ring.color', $event)"
        />
        <label for="mouse-ring-color">リングカラー</label>
      </div>

      <Divider class="grid-span-2" />

      <div class="section-title grid-span-2">ポインターリング</div>
      <div
        class="image-cell"
        v-for="type in ringImageTypes"
        :key="type.key"
      >
        <img
          class="mouse-image"
          v-if="mouseData.ring.images[type.key]"
          :src="`media://images/${mouseData.ring.images[type.key]}.png`"
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

      <Divider class="grid-span-2" />

      <div class="section-title grid-span-2">ボタンオーバーレイ（合成用）</div>
      <p class="helper grid-span-2">
        各ボタンの透明PNGを本体画像の上に重ねます。同時押しも自動で合成されますわ。
      </p>
      <div
        class="image-cell"
        v-for="type in overlayImageTypes"
        :key="type.key"
      >
        <img
          class="mouse-image"
          v-if="
            mouseData.buttonOverlays?.[
              type.key.startsWith('left')
                ? 'left'
                : type.key.startsWith('right')
                  ? 'right'
                  : 'middle'
            ]?.[
              type.key.endsWith('Active') ? 'active' : 'default'
            ]
          "
          :src="`media://images/${
            mouseData.buttonOverlays?.[
              type.key.startsWith('left')
                ? 'left'
                : type.key.startsWith('right')
                  ? 'right'
                  : 'middle'
            ]?.[
              type.key.endsWith('Active') ? 'active' : 'default'
            ]
          }.png`"
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

      <Divider class="grid-span-2" />

      <div class="section-title grid-span-2">マウス画像</div>
      <p class="helper grid-span-2">
        レガシー切替（本体を状態別に差し替え）。オーバーレイ優先で、未設定時のみ利用されますわ。
      </p>
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
.color-picker-field {
  display: flex;
  align-items: center;
  gap: 12px;

  label {
    font-size: 14px;
    color: #ccc;
  }
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
.helper {
  margin: -4px 0 4px;
  font-size: 12px;
  color: #9ea0a3;
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
.checkbox-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
