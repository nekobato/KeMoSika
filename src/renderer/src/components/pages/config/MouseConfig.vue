<script setup lang="ts">
import { PropType } from "vue";
import * as EP from "element-plus";
import { Icon } from "@iconify/vue";
import KeyboardKeyImageInput from "./KeyboardKeyImageInput.vue";
import { imageType, MouseData } from "@shared/types";
import { InputImageType } from "@/types/app";

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
    case "image.keyDefault":
    case "image.keyActive":
    case "image.mouseDefault":
    case "image.mouseLeftClick":
    case "image.mouseMiddleClick":
    case "image.mouseRightClick":
    case "image.mouseScrollUp":
    case "image.mouseScrollDown":
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

const onChangeImage = async (
  status: InputImageType,
  file: { path: string; name: string }
) => {
  const imageFileName = await window.ipc.invoke("image:save", {
    id: props.mouseData.id,
    imagePath: file.path
  });

  console.log(imageFileName);

  if (imageFileName) {
    emit("change", {
      ...props.mouseData,
      images: {
        ...props.mouseData.images,
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
      <EP.ElRow>
        <EP.ElText>Image</EP.ElText>
      </EP.ElRow>
      <EP.ElRow class="row image-upload" :gutter="8">
        <EP.ElCol :span="12">
          <EP.ElButton
            type="primary"
            size="small"
            @click="openImageDialog(props.mouseData.id, 'keyDefault')"
          />
          <KeyboardKeyImageInput
            label="Default"
            :value="mouseData.images.keyDefault"
            @change="onChangeImage('keyDefault', $event)"
          />
        </EP.ElCol>
        <EP.ElCol :span="12">
          <KeyboardKeyImageInput
            label="Active"
            :value="mouseData.images.keyActive"
            @change="onChangeImage('keyActive', $event)"
          />
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
</style>
