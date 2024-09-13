<script setup lang="ts">
import { PropType } from "vue";
import * as EP from "element-plus";
import { Icon } from "@iconify/vue";
import KeyboardKeyImageInput from "./KeyboardKeyImageInput.vue";
import { keyboardEventToElectronAccelerator } from "@/utils/key";
import { imageType, KeyboardKeyData } from "@shared/types";

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

const onChangeImage = async (
  status: "keyDefault" | "keyActive",
  file: { path: string; name: string }
) => {
  const imageFileName = await window.ipc.invoke("image:save", {
    id: props.keyData.id,
    imagePath: file.path
  });

  console.log(imageFileName);

  if (imageFileName) {
    emit("change", {
      ...props.keyData,
      images: {
        ...props.keyData.images,
        [status]: imageFileName
      }
    });
  }
};

const openImageDialog = async (id: string, status: imageType) => {
  emit("openImageDialog", { id, status });
};
</script>

<template>
  <section class="keyboard-key-config">
    <EP.ElForm class="form" :model="keyData" label-width="auto" v-if="keyData">
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
        <EP.ElCheckbox v-model="keyData.text.isVisible" label="Text" border />
      </EP.ElRow>
      <div v-if="keyData.text?.isVisible">
        <EP.ElFormItem label="Character">
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
        <EP.ElText>Image</EP.ElText>
      </EP.ElRow>
      <EP.ElRow class="row image-upload" :gutter="8">
        <EP.ElCol :span="12">
          <EP.ElButton
            type="primary"
            size="small"
            @click="openImageDialog(props.keyData.id, 'keyDefault')"
          />
          <KeyboardKeyImageInput
            label="Default"
            :value="keyData.images.keyDefault"
            @change="onChangeImage('keyDefault', $event)"
          />
        </EP.ElCol>
        <EP.ElCol :span="12">
          <KeyboardKeyImageInput
            label="Active"
            :value="keyData.images.keyActive"
            @change="onChangeImage('keyActive', $event)"
          />
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
</style>
