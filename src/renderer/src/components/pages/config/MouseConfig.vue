<script setup lang="ts">
import { computed, PropType } from "vue";
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
import {
  DEFAULT_MOUSE_BASE_IMAGE_ID,
  DEFAULT_MOUSE_BUTTON_IMAGE_IDS,
  resolveMouseVisualLayers
} from "@/components/mouseLayers";

const props = defineProps({
  mouseData: {
    type: Object as PropType<MouseData>,
    required: true
  }
});

const emit = defineEmits(["change", "openImageDialog"]);
const bodyImageTypes: { key: MouseBodyImageType; label: string }[] = [
  { key: "mouseDefault", label: "マウス本体" }
];
const ringImageTypes: { key: MouseRingImageType; label: string }[] = [
  { key: "ring", label: "リング画像" },
  { key: "pointer", label: "ポインタ画像" }
];
const OVERLAY_IMAGE_TYPES: {
  key: MouseOverlayImageType;
  button: keyof MouseData["buttonOverlays"];
  label: string;
}[] = [
  { key: "leftActive", button: "left", label: "左ボタン押下" },
  { key: "rightActive", button: "right", label: "右ボタン押下" },
  { key: "middleActive", button: "middle", label: "中ボタン押下" }
];

const mouseImagePreview = computed(() =>
  resolveMouseVisualLayers({
    baseImageId: props.mouseData.images.mouseDefault,
    fallbackBaseImageId: DEFAULT_MOUSE_BASE_IMAGE_ID,
    fallbackButtonImageIds: DEFAULT_MOUSE_BUTTON_IMAGE_IDS,
    buttonOverlays: props.mouseData.buttonOverlays,
    pressedButtons: [1, 2, 3]
  })
);

const overlayImageTypes = computed(() =>
  OVERLAY_IMAGE_TYPES.map((type) => ({
    ...type,
    imageId:
      mouseImagePreview.value.buttonLayers.find(
        ({ button }) => button === type.button
      )?.imageId ?? ""
  }))
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

      <Divider class="grid-span-2" />

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

      <Divider class="grid-span-2" />

      <div class="section-title grid-span-2">第2層：ボタン押下</div>
      <p class="helper grid-span-2">
        本体と同じサイズの透過PNGを登録します。押されているボタンの画像だけを重ね、同時押しは独立して合成します。
      </p>
      <div class="image-cell" v-for="type in overlayImageTypes" :key="type.key">
        <img
          class="mouse-image"
          v-if="type.imageId"
          :src="`media://images/${type.imageId}.png`"
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
