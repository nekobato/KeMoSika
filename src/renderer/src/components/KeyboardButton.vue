<script setup lang="ts">
import { computed, PropType } from "vue";
import { KeyboardKeyData } from "@shared/types";

const props = defineProps({
  keyData: Object as PropType<KeyboardKeyData>,
  isDown: {
    type: Boolean,
    required: true
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
  return {
    left: `${props.keyData.text.x}px`,
    top: `${props.keyData.text.y}px`,
    fontSize: `${props.keyData.text.size}px`,
    color: props.keyData.text.color
  };
});
</script>

<template>
  <button class="key" :class="{ down: props.isDown }" :style="buttonStyle">
    <span
      class="text"
      v-show="props.keyData.text.isVisible"
      :style="textStyle"
      >{{ props.keyData.text.character }}</span
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
  background: #2f3336;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-shadow: 0px 0px 40px #71d4fe, 0px 0px 80px #71d4fe;
  width: 64px;
  height: 64px;
  text-align: center;

  &.down {
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.7);
    color: #2f3336;
    background: #71d4fe;
    text-shadow: 0px 0px 40px #2f3336, 0px 0px 80px #2f3336;
  }
}

.text {
  position: relative;
}
</style>
