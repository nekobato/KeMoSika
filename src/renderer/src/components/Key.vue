<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  isDown: {
    type: Boolean,
    required: true
  },
  keyName: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  width: {
    type: Number
  }
});

const style = computed(() => {
  return {
    left: `${props.x}px`,
    top: `${props.y}px`,
    height: `${props.size}px`,
    width: `${props.width ? props.width : props.size}px`
  };
});
</script>

<template>
  <div class="key" :class="{ down: props.isDown }" :style="style">
    <span>{{ props.keyName }}</span>
  </div>
</template>

<style scoped>
.key {
  position: absolute;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.7);
  color: #71d4fe;
  background: #2f3336;
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
</style>
