<script setup lang="ts">
import { PropType } from "vue";
import * as EP from "element-plus";
import { Icon } from "@iconify/vue";
import { MouseData } from "@shared/types";
import { MouseImageType } from "@/types/app";

const props = defineProps({
  mouseData: {
    type: Object as PropType<MouseData>,
    required: true
  }
});

const emit = defineEmits(["change", "openImageDialog"]);

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
    case "images.mouseDefault":
    case "images.mouseLeftClick":
    case "images.mouseMiddleClick":
    case "images.mouseRightClick":
    case "images.mouseScrollUp":
    case "images.mouseScrollDown":
      emit("change", {
        ...props.mouseData,
        images: {
          ...props.mouseData.images,
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
  <section class="mouse-config">
    <EP.ElForm
      class="form"
      :model="mouseData"
      label-width="auto"
      v-if="mouseData"
    >
      <EP.ElRow>
        <EP.ElCol :span="12">
          <EP.ElFormItem label="X">
            <EP.ElInputNumber
              class="input-bounds"
              size="small"
              v-model="mouseData.x"
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
              v-model="mouseData.y"
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
              v-model="mouseData.width"
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
              v-model="mouseData.height"
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
              v-model="mouseData.rotation"
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
      <EP.ElDivider />
      <EP.ElRow>
        <EP.ElText>マウス画像</EP.ElText>
      </EP.ElRow>
      <EP.ElRow class="row image-upload" :gutter="8">
        <EP.ElCol :span="12">
          <img
            class="mouse-image"
            v-if="mouseData.images.mouseDefault"
            :src="`media://images/${mouseData.images.mouseDefault}.png`"
            @click="selectImage('mouseDefault')"
          />
          <div
            class="mouse-image-placeholder"
            v-else
            @click="selectImage('mouseDefault')"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>デフォルト</span>
          </div>
        </EP.ElCol>
        <EP.ElCol :span="12">
          <img
            class="mouse-image"
            v-if="mouseData.images.mouseLeftClick"
            :src="`media://images/${mouseData.images.mouseLeftClick}.png`"
            @click="selectImage('mouseLeftClick')"
          />
          <div
            class="mouse-image-placeholder"
            v-else
            @click="selectImage('mouseLeftClick')"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>左クリック</span>
          </div>
        </EP.ElCol>
      </EP.ElRow>
      <EP.ElRow class="row image-upload" :gutter="8">
        <EP.ElCol :span="12">
          <img
            class="mouse-image"
            v-if="mouseData.images.mouseRightClick"
            :src="`media://images/${mouseData.images.mouseRightClick}.png`"
            @click="selectImage('mouseRightClick')"
          />
          <div
            class="mouse-image-placeholder"
            v-else
            @click="selectImage('mouseRightClick')"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>右クリック</span>
          </div>
        </EP.ElCol>
        <EP.ElCol :span="12">
          <img
            class="mouse-image"
            v-if="mouseData.images.mouseMiddleClick"
            :src="`media://images/${mouseData.images.mouseMiddleClick}.png`"
            @click="selectImage('mouseMiddleClick')"
          />
          <div
            class="mouse-image-placeholder"
            v-else
            @click="selectImage('mouseMiddleClick')"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>中クリック</span>
          </div>
        </EP.ElCol>
      </EP.ElRow>
      <EP.ElRow class="row image-upload" :gutter="8">
        <EP.ElCol :span="12">
          <img
            class="mouse-image"
            v-if="mouseData.images.mouseScrollUp"
            :src="`media://images/${mouseData.images.mouseScrollUp}.png`"
            @click="selectImage('mouseScrollUp')"
          />
          <div
            class="mouse-image-placeholder"
            v-else
            @click="selectImage('mouseScrollUp')"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>スクロールアップ</span>
          </div>
        </EP.ElCol>
        <EP.ElCol :span="12">
          <img
            class="mouse-image"
            v-if="mouseData.images.mouseScrollDown"
            :src="`media://images/${mouseData.images.mouseScrollDown}.png`"
            @click="selectImage('mouseScrollDown')"
          />
          <div
            class="mouse-image-placeholder"
            v-else
            @click="selectImage('mouseScrollDown')"
          >
            <Icon class="icon" icon="mingcute:add-line" />
            <span>スクロールダウン</span>
          </div>
        </EP.ElCol>
      </EP.ElRow>
    </EP.ElForm>
  </section>
</template>

<style scoped lang="scss">
.mouse-config {
  padding: 16px;
}
.form {
  width: 100%;
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
.mouse-image {
  width: 100%;
  height: 100%;
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
