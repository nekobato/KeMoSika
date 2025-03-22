<script setup lang="ts">
import { PropType } from "vue";
import * as EP from "element-plus";
import { Icon } from "@iconify/vue";
import { keyboardEventToElectronAccelerator } from "@/utils/key";
import { KeyboardKeyData } from "@shared/types";
import { InputImageType } from "@/types/app";

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
  <section class="keyboard-key-config">
    <EP.ElForm class="form" :model="keyData" label-width="auto">
      <div class="keymap-group">
        <EP.ElTag
          class="keymap"
          type="info"
          closable
          v-for="(mapKey, index) in keyData.codeMap"
          @close="
            () => keyData.codeMap.splice(keyData.codeMap.indexOf(mapKey), 1)
          "
          @keydown="onKeyDownShortcutInput($event, index)"
          tabindex="0"
          >{{ mapKey || "Empty" }}</EP.ElTag
        >
        <EP.ElButton
          class="keymap"
          size="small"
          @click="() => keyData.codeMap.push('')"
        >
          <Icon class="icon" icon="mingcute:add-line" />Add</EP.ElButton
        >
      </div>
      <EP.ElRow>
        <EP.ElCol :span="12">
          <EP.ElFormItem label="X">
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="keyData.x"
              :min="0"
              :max="999999"
              :step="1"
              :controls="false"
              @change="onChangeInput('x', $event)"
            />
          </EP.ElFormItem>
        </EP.ElCol>
        <EP.ElCol :span="12">
          <EP.ElFormItem label="Y">
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="keyData.y"
              :min="0"
              :max="999999"
              :step="1"
              :controls="false"
              @change="onChangeInput('y', $event)"
            />
          </EP.ElFormItem>
        </EP.ElCol>
      </EP.ElRow>
      <EP.ElRow>
        <EP.ElCol :span="12">
          <EP.ElFormItem label="W">
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="keyData.width"
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
              v-model="keyData.height"
              :min="0"
              :max="999999"
              :step="1"
              :controls="false"
              @change="onChangeInput('height', $event)"
            />
          </EP.ElFormItem>
        </EP.ElCol>
      </EP.ElRow>
      <EP.ElRow>
        <EP.ElCol :span="12">
          <EP.ElFormItem class="formitem rotation">
            <template #label>
              <Icon icon="mingcute:clockwise-line" class="icon" />
            </template>
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="keyData.rotation"
              :min="0"
              :max="999999"
              :step="1"
              :controls="false"
              @change="onChangeInput('rotation', $event)"
            />
          </EP.ElFormItem>
        </EP.ElCol>
      </EP.ElRow>
      <EP.ElDivider />
      <EP.ElRow v-if="keyData.text">
        <EP.ElCheckbox
          v-model="keyData.text.isVisible"
          @change="onChangeInput('text.isVisible', $event)"
          label="Text"
          border
        />
      </EP.ElRow>
      <div v-if="keyData.text?.isVisible">
        <EP.ElFormItem label="Text">
          <EP.ElInput
            class="input-key"
            size="small"
            v-model="keyData.text.character"
            @change="onChangeInput('text.character', $event)"
          />
        </EP.ElFormItem>
        <EP.ElRow>
          <EP.ElCol :span="12">
            <EP.ElFormItem label="X">
              <EP.ElInputNumber
                class="input-bounds"
                size="small"
                v-model="keyData.text.x"
                :min="-9999"
                :max="9999"
                :step="1"
                :controls="false"
                @change="onChangeInput('text.x', $event)"
              />
            </EP.ElFormItem>
          </EP.ElCol>
          <EP.ElCol :span="12">
            <EP.ElFormItem label="Y">
              <EP.ElInputNumber
                class="input-bounds"
                size="small"
                v-model="keyData.text.y"
                :min="-9999"
                :max="9999"
                :step="1"
                :controls="false"
                @change="onChangeInput('text.y', $event)"
              />
            </EP.ElFormItem>
          </EP.ElCol>
        </EP.ElRow>
        <EP.ElRow>
          <EP.ElCol :span="12">
            <EP.ElFormItem label="Size">
              <EP.ElInputNumber
                class="input-bounds"
                size="small"
                v-model="keyData.text.size"
                :min="10"
                :max="99"
                :step="1"
                :controls="false"
                @change="onChangeInput('text.size', $event)"
              />
            </EP.ElFormItem>
          </EP.ElCol>
          <EP.ElCol :span="12">
            <EP.ElFormItem label="Color">
              <EP.ElColorPicker
                class="input-bounds"
                size="small"
                :show-alpha="true"
                v-model="keyData.text.color"
                @change="onChangeInput('text.color', $event)"
              />
            </EP.ElFormItem>
          </EP.ElCol>
        </EP.ElRow>
      </div>
      <EP.ElDivider />
      <EP.ElRow>
        <EP.ElText>キーボード画像</EP.ElText>
      </EP.ElRow>
      <EP.ElRow class="row image-upload" :gutter="8">
        <EP.ElCol :span="12">
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
        </EP.ElCol>
        <EP.ElCol :span="12">
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
  flex: 0 0 auto;
  width: 64px;
}
.keymap {
  cursor: pointer;
  border-color: #969696;
  &:not(:first-child) {
    margin-left: 4px;
  }
  &:focus {
    border-color: #409eff;
  }
  .icon {
    color: #fff;
    margin-right: 2px;
  }
}
.submit-row {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
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
