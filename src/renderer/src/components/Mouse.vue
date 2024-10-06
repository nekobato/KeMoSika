<script setup lang="ts">
import { computed, PropType } from "vue";
import { MouseData, MouseState } from "@shared/types";

const props = defineProps({
  data: { type: Object as PropType<MouseData>, required: true },
  states: { type: Object as PropType<MouseState> }
});

const mouseMoveDegreeStyle = computed(() => {
  if (!props.states) return {};
  return {
    transform: `rotate(${Math.atan2(
      props.states.to.y - props.states.from.y,
      props.states.to.x - props.states.from.x
    )}rad)`
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
    </div>
    <div class="pointer-ring" :style="mouseMoveDegreeStyle">
      <div class="pointer"></div>
    </div>
  </div>
</template>

<style scoped>
.mouse-container {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mouse {
  position: absolute;
  transform-origin: 50% 50%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mouse-body {
  width: 40px;
  height: 80px;
  background: #888888;
  border-radius: 8px;
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
  border: 1px solid #fff;
  border-radius: 50%;
}

.pointer {
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transform-origin: 50% 50%;
  position: absolute;
  top: calc(50% - 8px);
  left: calc(100% - 8px);
}
</style>
