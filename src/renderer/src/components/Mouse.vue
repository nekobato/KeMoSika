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

const getMouseImage = () => {
  // マウスの状態に応じた画像を返す
  if (props.states && props.states.buttons && props.states.buttons.length > 0) {
    // 左クリック
    if (props.states.buttons.includes(1) && props.data.images.mouseLeftClick) {
      return `media://images/${props.data.images.mouseLeftClick}.png`;
    }
    // 右クリック
    if (props.states.buttons.includes(2) && props.data.images.mouseRightClick) {
      return `media://images/${props.data.images.mouseRightClick}.png`;
    }
    // 中クリック
    if (
      props.states.buttons.includes(3) &&
      props.data.images.mouseMiddleClick
    ) {
      return `media://images/${props.data.images.mouseMiddleClick}.png`;
    }
  }

  // スクロール
  if (props.states && props.states.type === 2) {
    if (props.states.amount > 0 && props.data.images.mouseScrollUp) {
      return `media://images/${props.data.images.mouseScrollUp}.png`;
    }
    if (props.states.amount < 0 && props.data.images.mouseScrollDown) {
      return `media://images/${props.data.images.mouseScrollDown}.png`;
    }
  }

  // デフォルト
  if (props.data.images.mouseDefault) {
    return `media://images/${props.data.images.mouseDefault}.png`;
  }

  return undefined;
};
</script>

<template>
  <div class="mouse-container" :style="buttonStyle">
    <div class="mouse">
      <img v-if="getMouseImage()" :src="getMouseImage()" class="mouse-image" />
      <div v-else class="mouse-body"></div>
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

.mouse-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
