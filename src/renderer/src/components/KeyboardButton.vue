<script setup lang="ts">
import { computed } from "vue";
import type { KeyboardKeyData } from "@shared/types";
import { resolveKeyboardKeyCharacter } from "@/utils/keyText";

const props = withDefaults(
  defineProps<{
    keyData: KeyboardKeyData;
    isDown?: boolean;
    shiftPressed?: boolean;
    capsLockActive?: boolean;
  }>(),
  {
    isDown: false,
    shiftPressed: false,
    capsLockActive: false
  }
);

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
  if (!props.keyData.text) {
    return {};
  }

  const style: Record<string, string> = {
    left: `${props.keyData.text.x}px`,
    top: `${props.keyData.text.y}px`,
    fontSize: `${props.keyData.text.size}px`,
    color: props.keyData.text.color
  };

  const fontFamily = props.keyData.text.font?.trim();
  if (fontFamily) {
    style.fontFamily = fontFamily;
  }

  return style;
});

const displayCharacter = computed(() => {
  if (!props.keyData.text) return "";

  return resolveKeyboardKeyCharacter(props.keyData.text, {
    shiftPressed: props.shiftPressed,
    capsLockActive: props.capsLockActive
  });
});

const hasKeyImage = computed(
  () => !!props.keyData.images.keyDefault
);
const keyDefaultImageSrc = computed(
  () => `media://images/${props.keyData.images.keyDefault}.png`
);
const keyActiveImageSrc = computed(
  () => `media://images/${props.keyData.images.keyActive}.png`
);
</script>

<template>
  <button
    class="key"
    :class="{
      down: props.isDown,
      'no-image': !hasKeyImage
    }"
    :style="buttonStyle"
  >
    <img
      v-if="hasKeyImage"
      class="key-image default"
      :src="keyDefaultImageSrc"
    />
    <img
      v-if="hasKeyImage && props.keyData.images.keyActive"
      class="key-image active"
      :src="keyActiveImageSrc"
    />
    <span
      class="text"
      v-show="props.keyData.text?.isVisible"
      :style="textStyle"
      >{{ displayCharacter }}</span
    >
  </button>
</template>

<style scoped>
.key {
  background-color: transparent;
  position: absolute;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: #71d4fe;
  width: 64px;
  height: 64px;
  text-align: center;
  border: none;

  &.no-image {
    background: #2f3336;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .key-image.default {
    visibility: visible;
  }

  .key-image.active {
    visibility: hidden;
  }

  &.down {
    color: #2f3336;
    background: #71d4fe;

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
  object-fit: fill;
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
