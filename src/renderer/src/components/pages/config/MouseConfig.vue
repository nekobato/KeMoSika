<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";
import { Icon } from "@iconify/vue";
import type { MouseData } from "@shared/types";
import type {
  MouseBodyImageType,
  MouseImageType,
  MouseOverlayImageType,
  MouseRingImageType,
} from "@/types/app";
import {
  DEFAULT_MOUSE_BASE_IMAGE_ID,
  DEFAULT_MOUSE_BUTTON_IMAGE_IDS,
  resolveMouseVisualLayers,
} from "@/components/mouseLayers";

const props = defineProps({
  mouseData: {
    type: Object as PropType<MouseData>,
    required: true,
  },
});

const emit = defineEmits(["change", "openImageDialog"]);
const bodyImageTypes: { key: MouseBodyImageType; label: string }[] = [
  { key: "mouseDefault", label: "マウス本体" },
];
const ringImageTypes: { key: MouseRingImageType; label: string }[] = [
  { key: "ring", label: "リング画像" },
  { key: "pointer", label: "ポインタ画像" },
];
const OVERLAY_IMAGE_TYPES: {
  key: MouseOverlayImageType;
  button: keyof MouseData["buttonOverlays"];
  label: string;
}[] = [
  { key: "leftActive", button: "left", label: "左ボタン押下" },
  { key: "rightActive", button: "right", label: "右ボタン押下" },
  { key: "middleActive", button: "middle", label: "中ボタン押下" },
  { key: "x1Active", button: "x1", label: "X1ボタン押下" },
  { key: "x2Active", button: "x2", label: "X2ボタン押下" },
];

const mouseImagePreview = computed(() =>
  resolveMouseVisualLayers({
    baseImageId: props.mouseData.images.mouseDefault,
    fallbackBaseImageId: DEFAULT_MOUSE_BASE_IMAGE_ID,
    fallbackButtonImageIds: DEFAULT_MOUSE_BUTTON_IMAGE_IDS,
    buttonOverlays: props.mouseData.buttonOverlays,
    pressedButtons: [1, 2, 3, 4, 5],
  }),
);

const overlayImageTypes = computed(() =>
  OVERLAY_IMAGE_TYPES.map((type) => ({
    ...type,
    imageId:
      mouseImagePreview.value.buttonLayers.find(
        ({ button }) => button === type.button,
      )?.imageId ?? "",
  })),
);

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
        [key]: value,
      });
      break;
    case "ring.size":
    case "ring.color":
    case "ring.speedSensitivity":
      emit("change", {
        ...props.mouseData,
        ring: {
          ...props.mouseData.ring,
          [key.split(".")[1]]: value,
        },
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
      <ElInputNumber
        id="mouse-x"
        class="field-control"
        size="small"
        :controls="false"
        v-model="mouseData.x"
        :min="0"
        :max="999999"
        :step="1"
        @update:modelValue="onChangeInput('x', $event)"
      >
        <template #prefix><span>X</span></template>
      </ElInputNumber>
      <ElInputNumber
        id="mouse-y"
        class="field-control"
        size="small"
        :controls="false"
        v-model="mouseData.y"
        :min="0"
        :max="999999"
        :step="1"
        @update:modelValue="onChangeInput('y', $event)"
      >
        <template #prefix><span>Y</span></template>
      </ElInputNumber>

      <ElInputNumber
        id="mouse-w"
        class="field-control"
        size="small"
        :controls="false"
        v-model="mouseData.width"
        :min="0"
        :max="999999"
        :step="1"
        @update:modelValue="onChangeInput('width', $event)"
      >
        <template #prefix><span>W</span></template>
      </ElInputNumber>
      <ElInputNumber
        id="mouse-h"
        class="field-control"
        size="small"
        :controls="false"
        v-model="mouseData.height"
        :min="0"
        :max="999999"
        :step="1"
        @update:modelValue="onChangeInput('height', $event)"
      >
        <template #prefix><span>H</span></template>
      </ElInputNumber>

      <ElInputNumber
        id="mouse-rotation"
        class="field-control grid-span-2"
        size="small"
        :controls="false"
        v-model="mouseData.rotation"
        :min="-999999"
        :max="999999"
        :step="1"
        @update:modelValue="onChangeInput('rotation', $event)"
      >
        <template #prefix>
          <Icon icon="mingcute:clockwise-line" class="icon" />
        </template>
      </ElInputNumber>

      <div class="checkbox-field grid-span-2">
        <ElSwitch
          id="mouse-shadow"
          size="small"
          v-model="mouseData.shadow"
          @update:modelValue="onChangeInput('shadow', $event)"
        />
        <label for="mouse-shadow">影を付ける</label>
      </div>

      <ElInputNumber
        id="mouse-ring-size"
        class="field-control grid-span-2"
        size="small"
        :controls="false"
        v-model="mouseData.ring.size"
        :min="0"
        :max="999999"
        :step="1"
        @update:modelValue="onChangeInput('ring.size', $event)"
      >
        <template #prefix><span>D</span></template>
      </ElInputNumber>

      <ElInputNumber
        id="mouse-speed-sensitivity"
        class="field-control grid-span-2"
        size="small"
        :controls="false"
        v-model="mouseData.ring.speedSensitivity"
        :min="1"
        :max="100"
        :step="1"
        aria-label="速度感度"
        @update:modelValue="onChangeInput('ring.speedSensitivity', $event)"
      >
        <template #prefix><span>速度感度</span></template>
      </ElInputNumber>

      <div class="color-picker-field grid-span-2">
        <ElColorPicker
          id="mouse-ring-color"
          class="color-input"
          v-model="mouseData.ring.color"
          @update:modelValue="onChangeInput('ring.color', $event)"
        />
        <label for="mouse-ring-color">リングカラー</label>
      </div>

      <ElDivider class="grid-span-2" />

      <div class="section-title grid-span-2">ポインターリング</div>
      <div class="image-cell" v-for="type in ringImageTypes" :key="type.key">
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

      <ElDivider class="grid-span-2" />

      <div class="section-title grid-span-2">第1層：マウス本体</div>
      <p class="helper grid-span-2">
        押下状態にかかわらず表示し続ける、固定のマウス本体画像です。
      </p>
      <div class="image-cell" v-for="type in bodyImageTypes" :key="type.key">
        <img
          class="mouse-image"
          v-if="mouseImagePreview.baseImageId"
          :src="`media://images/${mouseImagePreview.baseImageId}.png`"
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

      <ElDivider class="grid-span-2" />

      <div class="section-title grid-span-2">第2層：ボタン押下</div>
      <p class="helper grid-span-2">
        本体と同じサイズの透過PNGを登録します。押されているボタンの画像だけを重ね、同時押しは独立して合成します。
      </p>
      <div class="image-cell" v-for="type in overlayImageTypes" :key="type.key">
        <img
          class="mouse-image"
          v-if="type.imageId"
          :src="`media://images/${type.imageId}.png`"
          :alt="type.label"
          :title="type.label"
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
  padding: 16px 20px 20px;
  color: #eef1f3;
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
.field-control {
  width: 100%;
}
.image-cell {
  min-height: 100px;
}
.section-title {
  margin-bottom: 8px;
  color: #dfe5ea;
  font-size: 12px;
  font-weight: 700;
}
.color-picker-field {
  display: flex;
  align-items: center;
  gap: 12px;

  label {
    color: #cbd3da;
    font-size: 12px;
  }
}
.mouse-image {
  width: 100%;
  height: 100px;
  object-fit: contain;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 6px;

  &:hover {
    border-color: #67c7d9;
  }
}
.helper {
  margin: -4px 0 4px;
  font-size: 12px;
  color: #aeb6bd;
}
.mouse-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #aeb6bd;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.22);
  border-radius: 6px;

  &:hover {
    background: rgba(103, 199, 217, 0.08);
    border-color: #67c7d9;
  }

  .icon {
    font-size: 24px;
    color: #aeb6bd;
  }

  span {
    margin-top: 4px;
    font-size: 12px;
    color: #cbd3da;
  }
}
.checkbox-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  label {
    color: #cbd3da;
    font-size: 12px;
  }
}
</style>
