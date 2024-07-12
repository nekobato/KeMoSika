<script setup lang="ts">
import { PropType, ref } from "vue";
import * as EP from "element-plus";
import { KeyboardKeyData } from "../../../types/app";

defineProps({
  keyData: Object as PropType<KeyboardKeyData>
});
</script>

<template>
  <section class="keyboard-key-config">
    <EP.ElForm class="form" :model="keyData" label-width="auto">
      <EP.ElFormItem label="Key">
        <EP.ElInput
          class="input-key"
          size="small"
          v-model="keyData.character"
        />
      </EP.ElFormItem>
      <EP.ElFormItem label="KeyMap">
        <EP.ElTag size="small" type="info" v-for="mapKey in keyData.codeMaps">{{
          mapKey
        }}</EP.ElTag>
      </EP.ElFormItem>
      <EP.ElRow>
        <EP.ElCol :span="12">
          <EP.ElFormItem label="TextSize">
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="keyData.fontSize"
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
              v-model="keyData.color"
            />
          </EP.ElFormItem>
        </EP.ElCol>
      </EP.ElRow>
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
  padding: 16px;
  background-color: #252525;
}
.form {
  width: 100%;
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
</style>
