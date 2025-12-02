<script setup lang="ts">
import { PropType } from "vue";
import { Icon } from "@iconify/vue";
import { keyboardEventToElectronAccelerator } from "@/utils/key";
import { KeyboardKeyData } from "@shared/types";
import { InputImageType } from "@/types/app";
import Chip from "primevue/chip";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import ColorPicker from "primevue/colorpicker";
import Divider from "primevue/divider";

const props = defineProps({
  keyData: {
    type: Object as PropType<KeyboardKeyData>,
    required: true
  }
});

const emit = defineEmits(["change", "openImageDialog"]);

const onKeyDownShortcutInput = async (e: KeyboardEvent, index: number) => {
  e.preventDefault();
  const targetCodeMap = props.keyData.codeMap[index];
  const shortcut = keyboardEventToElectronAccelerator(e);

  if (shortcut === "" || props.keyData.codeMap.includes(shortcut)) {
    return;
  }

  if (targetCodeMap) {
    emit("change", {
      ...props.keyData,
      codeMap: props.keyData.codeMap.map((code, i) =>
        i === index ? shortcut : code
      )
    });
  }
};

const onChangeInput = (key: string, value: any) => {
  switch (key) {
    case "x":
    case "y":
    case "width":
    case "height":
    case "rotation":
      emit("change", {
        ...props.keyData,
        [key]: value
      });
      break;
    case "text.isVisible":
    case "text.character":
    case "text.x":
    case "text.y":
    case "text.size":
    case "text.color":
      emit("change", {
        ...props.keyData,
        text: {
          ...props.keyData.text,
          [key.split(".")[1]]: value
        }
      });
      break;
  }
};

const selectImage = (type: InputImageType) => {
  emit("openImageDialog", type);
};
</script>

<template>
  <section class="keyboard-key-config" v-if="keyData">
    <div class="form">
      <div class="keymap-group">
        <Chip
          v-for="(mapKey, index) in keyData.codeMap"
          :key="`${mapKey}-${index}`"
          class="keymap"
          removable
          @remove="
            () => keyData.codeMap.splice(keyData.codeMap.indexOf(mapKey), 1)
          "
          @keydown="onKeyDownShortcutInput($event, index)"
          tabindex="0"
          :label="mapKey || 'Empty'"
        />
        <Button
          class="keymap add-button"
          size="small"
          outlined
          @click="() => keyData.codeMap.push('')"
        >
          <Icon class="icon" icon="mingcute:add-line" />Add
        </Button>
      </div>

      <div class="field-grid">
        <div class="field">
          <label for="key-x">X</label>
          <InputNumber
            inputId="key-x"
            class="input-bounds"
            v-model="keyData.x"
            :useGrouping="false"
            :min="0"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('x', $event)"
          />
        </div>
        <div class="field">
          <label for="key-y">Y</label>
          <InputNumber
            inputId="key-y"
            class="input-bounds"
            v-model="keyData.y"
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
          <label for="key-w">W</label>
          <InputNumber
            inputId="key-w"
            class="input-bounds"
            v-model="keyData.width"
            :useGrouping="false"
            :min="0"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('width', $event)"
          />
        </div>
        <div class="field">
          <label for="key-h">H</label>
          <InputNumber
            inputId="key-h"
            class="input-bounds"
            v-model="keyData.height"
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
          <label class="icon-label" for="key-rotation">
            <Icon icon="mingcute:clockwise-line" class="icon" />
          </label>
          <InputNumber
            inputId="key-rotation"
            class="input-bounds"
            v-model="keyData.rotation"
            :useGrouping="false"
            :min="-999999"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('rotation', $event)"
          />
        </div>
      </div>

      <Divider />

      <div v-if="keyData.text">
        <div class="field checkbox-field">
          <Checkbox
            inputId="key-text-visible"
            binary
            v-model="keyData.text.isVisible"
            @update:modelValue="onChangeInput('text.isVisible', $event)"
          />
          <label for="key-text-visible">Text</label>
        </div>

        <div v-if="keyData.text.isVisible">
          <div class="field">
            <label for="key-text">Text</label>
            <InputText
              id="key-text"
              class="input-key"
              v-model="keyData.text.character"
              @update:modelValue="onChangeInput('text.character', $event)"
            />
          </div>

          <div class="field-grid">
            <div class="field">
              <label for="key-text-x">X</label>
              <InputNumber
                inputId="key-text-x"
                class="input-bounds"
                v-model="keyData.text.x"
                :useGrouping="false"
                :min="-9999"
                :max="9999"
                :step="1"
                @update:modelValue="onChangeInput('text.x', $event)"
              />
            </div>
            <div class="field">
              <label for="key-text-y">Y</label>
              <InputNumber
                inputId="key-text-y"
                class="input-bounds"
                v-model="keyData.text.y"
                :useGrouping="false"
                :min="-9999"
                :max="9999"
                :step="1"
                @update:modelValue="onChangeInput('text.y', $event)"
              />
            </div>
          </div>

          <div class="field-grid">
            <div class="field">
              <label for="key-text-size">Size</label>
              <InputNumber
                inputId="key-text-size"
                class="input-bounds"
                v-model="keyData.text.size"
                :useGrouping="false"
                :min="10"
                :max="99"
                :step="1"
                @update:modelValue="onChangeInput('text.size', $event)"
              />
            </div>
            <div class="field">
              <label for="key-text-color">Color</label>
              <ColorPicker
                inputId="key-text-color"
                class="input-bounds"
                v-model="keyData.text.color"
                @update:modelValue="onChangeInput('text.color', $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <Divider />

      <div class="section-title">キーボード画像</div>
      <div class="image-grid">
        <div class="image-cell">
          <img
            class="key-image"
            v-if="keyData.images.keyDefault"
            :src="`media://images/${keyData.images.keyDefault}.png`"
            @click="selectImage('keyDefault')"
          />
          <div
            class="key-image-placeholder"
            v-else
            @click="selectImage('keyDefault')"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>デフォルト</span>
          </div>
        </div>
        <div class="image-cell">
          <img
            class="key-image"
            v-if="keyData.images.keyActive"
            :src="`media://images/${keyData.images.keyActive}.png`"
            @click="selectImage('keyActive')"
          />
          <div
            class="key-image-placeholder"
            v-else
            @click="selectImage('keyActive')"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>アクティブ</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.keyboard-key-config {
  padding: 16px;
}
.form {
  width: 100%;
}
.keymap-group {
  padding: 0 0 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.input-key {
  width: 64px;
  ::v-deep(input) {
    text-align: center;
  }
}
.input-bounds {
  flex: 0 0 auto;
  width: 64px;
}
.keymap {
  cursor: pointer;
  &:focus {
    outline: 1px solid #409eff;
  }
}
.add-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
.section-title {
  margin-bottom: 8px;
  font-size: 14px;
  color: #4c4d4f;
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
    min-width: 40px;
    color: #4c4d4f;
  }

  &.checkbox-field {
    gap: 6px;
    align-items: center;

    label {
      min-width: auto;
    }
  }

  .icon-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
  }
}
.key-image {
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
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
}
.image-cell {
  min-height: 100px;
}
.key-image-placeholder {
  width: 100%;
  height: 100px;
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
