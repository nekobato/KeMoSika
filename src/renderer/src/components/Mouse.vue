<script setup lang="ts">
import { computed, PropType } from "vue";
import { MouseData, MouseState } from "@shared/types";

const props = defineProps({
  data: { type: Object as PropType<MouseData>, required: true },
  states: { type: Object as PropType<MouseState> }
});

// computed mouse move degree
const mouseMoveDegreeStyle = computed(() => {
  if (!props.states) return {};
  return {
    transform: `rotate(${Math.atan2(props.states.y, props.states.x)}dev)`
  };
});

const buttonStyle = computed(() => {
  return {
    left: `${props.data.x}px`,
    top: `${props.data.y}px`,
    height: `${props.data.height}px`,
    width: `${props.data.width}px`,
    transform: `rotate(${props.data.rotation}deg)`
  };
});
</script>

<template>
  <div class="mouse-container" :style="buttonStyle">
    <div class="mouse">
      <div class="mouse-body"></div>
      <div class="mouse-head"></div>
    </div>
    <div class="pointer-ring">
      <div class="pointer" :style="mouseMoveDegreeStyle"></div>
    </div>
  </div>
</template>

<style scoped>
.mouse-container {
  position: absolute;
}

.mouse {
  position: absolute;
  transform-origin: 50% 50%;
  background: #000;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mouse-body {
  width: 20px;
  height: 40px;
  background: #000;
  border-radius: 10px;
}

.mouse-head {
  width: 40px;
  height: 40px;
  background: #000;
  border-radius: 50%;
  position: absolute;
  top: -20px;
}

.pointer-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pointer {
  width: 10px;
  height: 10px;
  background: #000;
  border-radius: 50%;
  transform-origin: 50% 50%;
}
</style>
