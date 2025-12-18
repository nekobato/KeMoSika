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
import ToggleSwitch from "primevue/toggleswitch";
import ColorPicker from "primevue/colorpicker";
import Divider from "primevue/divider";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";

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
    case "shadow":
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
      <div class="grid">
        <div class="keymap-group grid-span-2">
          <Chip
            v-for="(mapKey, index) in keyData.codeMap"
            :key="`${mapKey}-${index}`"
            class="keymap"
            size="small"
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

        <IconField>
          <InputIcon><span>X</span></InputIcon>
          <InputNumber
            inputId="key-x"
            size="small"
            fluid
            v-model="keyData.x"
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
            inputId="key-y"
            size="small"
            fluid
            v-model="keyData.y"
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
            inputId="key-w"
            size="small"
            fluid
            v-model="keyData.width"
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
            inputId="key-h"
            size="small"
            fluid
            v-model="keyData.height"
            :useGrouping="false"
            :min="0"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('height', $event)"
          />
        </IconField>

        <IconField>
          <InputIcon
            ><Icon icon="mingcute:clockwise-line" class="icon"
          /></InputIcon>
          <InputNumber
            inputId="key-rotation"
            size="small"
            fluid
            v-model="keyData.rotation"
            :useGrouping="false"
            :min="-999999"
            :max="999999"
            :step="1"
            @update:modelValue="onChangeInput('rotation', $event)"
          />
        </IconField>

        <div />
      </div>

      <div class="checkbox-field">
        <ToggleSwitch
          inputId="key-shadow"
          size="small"
          binary
          v-model="keyData.shadow"
          @update:modelValue="onChangeInput('shadow', $event)"
        />
        <label for="key-shadow">影を付ける</label>
      </div>

      <Divider />

      <div class="checkbox-field" v-if="keyData.text">
        <ToggleSwitch
          inputId="key-text-visible"
          size="small"
          binary
          v-model="keyData.text.isVisible"
          @update:modelValue="onChangeInput('text.isVisible', $event)"
        />
        <label for="key-text-visible">Text</label>
      </div>

      <div class="grid" v-if="keyData.text?.isVisible">
        <IconField>
          <InputIcon>
            <Icon icon="mingcute:text-2-line" />
          </InputIcon>
          <InputText
            id="key-text"
            size="small"
            fluid
            v-model="keyData.text.character"
            @update:modelValue="onChangeInput('text.character', $event)"
          />
        </IconField>

        <div class="color-picker-field">
          <ColorPicker
            inputId="key-text-color"
            class="color-input"
            v-model="keyData.text.color"
            @update:modelValue="onChangeInput('text.color', $event)"
          />
          <span>Color</span>
        </div>

        <IconField>
          <InputIcon><span>X</span></InputIcon>
          <InputNumber
            inputId="key-text-x"
            size="small"
            fluid
            v-model="keyData.text.x"
            :useGrouping="false"
            :min="-9999"
            :max="9999"
            :step="1"
            @update:modelValue="onChangeInput('text.x', $event)"
          />
        </IconField>
        <IconField>
          <InputIcon><span>Y</span></InputIcon>
          <InputNumber
            inputId="key-text-y"
            size="small"
            fluid
            v-model="keyData.text.y"
            :useGrouping="false"
            :min="-9999"
            :max="9999"
            :step="1"
            @update:modelValue="onChangeInput('text.y', $event)"
          />
        </IconField>

        <IconField>
          <InputIcon>
            <Icon icon="mingcute:font-size-line" />
          </InputIcon>
          <InputNumber
            inputId="key-text-size"
            size="small"
            fluid
            v-model="keyData.text.size"
            :useGrouping="false"
            :min="10"
            :max="99"
            :step="1"
            @update:modelValue="onChangeInput('text.size', $event)"
          />
        </IconField>
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
}
.grid {
  margin: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  .grid-span-2 {
    grid-column: 1 / -1;
  }
}
.keymap-group {
  padding: 0 0 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.checkbox-field {
  padding-bottom: 12px;
}
.checkbox-field,
.color-picker-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
