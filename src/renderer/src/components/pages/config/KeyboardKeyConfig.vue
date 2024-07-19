<script setup lang="ts">
import { PropType, ref } from "vue";
import * as EP from "element-plus";
import { Icon } from "@iconify/vue";
import KeyboardKeyImageInput from "./KeyboardKeyImageInput.vue";
import { keyboardEventToElectronAccelerator } from "@/utils/key";
import { KeyboardKeyData } from "@shared/types";

defineProps({
  keyData: Object as PropType<KeyboardKeyData>
});

const keyImageInputDefault = ref({
  isDragOver: false
});

const keyImageInputActive = ref({
  isDragOver: false
});

const onKeyDownShortcutInput = async (e: KeyboardEvent) => {
  const shortcut = keyboardEventToElectronAccelerator(e);

  if (shortcut === "") {
    return;
  }

  // if (config) {
  //   await window.ipc.invoke("set:shortcuts", {
  //     name: "toggleCommand",
  //     command: shortcut
  //   });
  //   emit("change");
  // }
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
          v-for="mapKey in keyData.codeMap"
          @close="
            () => keyData.codeMap.splice(keyData.codeMap.indexOf(mapKey), 1)
          "
          @keydown="onKeyDownShortcutInput"
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
              :controls="false"
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
              :controls="false"
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
              :controls="false"
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
              :controls="false"
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
              :controls="false"
            />
          </EP.ElFormItem>
        </EP.ElCol>
      </EP.ElRow>
      <EP.ElDivider />
      <EP.ElRow>
        <EP.ElCheckbox v-model="keyData.text.isVisible" label="Text" border />
      </EP.ElRow>
      <div v-if="keyData.text.isVisible">
        <EP.ElFormItem label="Character">
          <EP.ElInput
            class="input-key"
            size="small"
            v-model="keyData.text.character"
          />
        </EP.ElFormItem>
        <EP.ElRow>
          <EP.ElCol :span="12">
            <EP.ElFormItem label="Size">
              <EP.ElInputNumber
                class="input-bounds"
                size="small"
                v-model="keyData.text.size"
                :min="10"
                :max="99"
                :controls="false"
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
          <KeyboardKeyImageInput label="Default" />
        </EP.ElCol>
        <EP.ElCol :span="12">
          <KeyboardKeyImageInput label="Active" />
        </EP.ElCol>
      </EP.ElRow>
      <EP.ElRow class="submit-row">
        <EP.ElButton type="primary">Save</EP.ElButton>
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
  border-color: #969696;
  &:not(:first-child) {
    margin-left: 4px;
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
