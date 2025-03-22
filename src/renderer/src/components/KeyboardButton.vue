<script setup lang="ts">
import { computed, PropType } from "vue";
import { KeyboardKeyData } from "@shared/types";

const props = defineProps({
  keyData: { type: Object as PropType<KeyboardKeyData>, required: true },
  isDown: {
    type: Boolean
  }
});

const buttonStyle = computed(() => {
  return {
    left: `${props.keyData.x}px`,
    top: `${props.keyData.y}px`,
    height: `${props.keyData.height}px`,
    width: `${props.keyData.width}px`,
    transform: `rotate(${props.keyData.rotation}deg)`
  };
});

const textStyle = computed(() => {
  return props.keyData.text
    ? {
        left: `${props.keyData.text.x}px`,
        top: `${props.keyData.text.y}px`,
        fontSize: `${props.keyData.text.size}px`,
        color: props.keyData.text.color
      }
    : {};
});
</script>

<template>
  <button
    class="key"
    :class="{
      down: props.isDown,
      'no-image': !props.keyData.images.keyDefault
    }"
    :style="buttonStyle"
  >
    <img
      v-if="props.keyData.images.keyDefault"
      class="key-image default"
      :src="`media://images/${props.keyData.images.keyDefault}.png`"
    />
    <img
      v-if="props.keyData.images.keyActive"
      class="key-image active"
      :src="`media://images/${props.keyData.images.keyActive}.png`"
    />
    <span
      class="text"
      v-show="props.keyData.text?.isVisible"
      :style="textStyle"
      >{{ props.keyData.text?.character }}</span
    >
  </button>
</template>

<style scoped>
.key {
  position: absolute;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.7);
  color: #71d4fe;
  text-shadow: 0px 0px 40px #71d4fe, 0px 0px 80px #71d4fe;
  width: 64px;
  height: 64px;
  text-align: center;
  border: none;

  &.no-image {
    background: #2f3336;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .keyimage.default {
    visibility: visible;
  }

  .key-image.active {
    visibility: hidden;
  }

  &.down {
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.7);
    color: #2f3336;
    background: #71d4fe;
    text-shadow: 0px 0px 40px #2f3336, 0px 0px 80px #2f3336;

    .key-image.default {
      visibility: hidden;
    }

    .key-image.active {
      visibility: visible;
    }
  }
}

.key-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  z-index: 0;
}

.text {
  display: inline-flex;
  position: relative;
  margin: auto;
  z-index: 1;
}
</style>
