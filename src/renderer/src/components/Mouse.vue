<script setup lang="ts">
import { computed, PropType } from "vue";
import { MouseData, MouseState } from "@shared/types";

const DEFAULT_RING_COLOR = "#ffffff";
const POINTER_SIZE = 16;
const LEFT_BUTTON = 1;
const RIGHT_BUTTON = 2;
const MIDDLE_BUTTON = 3;

type DefaultMouseVisualState =
  | "default"
  | "leftClick"
  | "rightClick"
  | "middleClick"
  | "scrollUp"
  | "scrollDown";

/** Resolves an image from the media protocol image store. */
const getStoredImageSource = (imageName: string): string =>
  `media://images/${imageName}.png`;

const defaultMouseImages: Record<DefaultMouseVisualState, string> = {
  default: getStoredImageSource("default_mouse_default"),
  leftClick: getStoredImageSource("default_mouse_left_click"),
  rightClick: getStoredImageSource("default_mouse_right_click"),
  middleClick: getStoredImageSource("default_mouse_middle_click"),
  scrollUp: getStoredImageSource("default_mouse_scroll_up"),
  scrollDown: getStoredImageSource("default_mouse_scroll_down")
};

const props = defineProps({
  data: { type: Object as PropType<MouseData>, required: true },
  states: { type: Object as PropType<MouseState> }
});

const ringData = computed(() => ({
  size:
    props.data.ring?.size ??
    Math.max(props.data.width ?? 0, props.data.height ?? 0),
  color: props.data.ring?.color ?? DEFAULT_RING_COLOR,
  images: {
    ring: props.data.ring?.images?.ring ?? "",
    pointer: props.data.ring?.images?.pointer ?? ""
  }
}));

const pointerRotation = computed(() => {
  if (!props.states) return 0;
  return Math.atan2(
    props.states.to.y - props.states.from.y,
    props.states.to.x - props.states.from.x
  );
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

const overlayData = computed(() => props.data.buttonOverlays);

const isButtonDown = (button: number) =>
  !!props.states?.buttons?.includes(button);

const ringStyle = computed(() => {
  const { size, color, images } = ringData.value;
  const transform = `translate(-50%, -50%) rotate(${pointerRotation.value}rad)`;
  const style: Record<string, string> = {
    width: `${size}px`,
    height: `${size}px`,
    transform
  };

  if (images.ring) {
    style.backgroundImage = `url(media://images/${images.ring}.png)`;
    style.backgroundRepeat = "no-repeat";
    style.backgroundSize = "contain";
    style.backgroundPosition = "center";
  } else {
    style.border = `2px solid ${color}`;
  }

  return style;
});

const pointerStyle = computed(() => {
  const { color, images } = ringData.value;
  const base = {
    width: `${POINTER_SIZE}px`,
    height: `${POINTER_SIZE}px`,
    top: `calc(50% - ${POINTER_SIZE / 2}px)`,
    left: `calc(100% - ${POINTER_SIZE / 2}px)`
  };

  if (images.pointer) {
    return {
      ...base,
      backgroundImage: `url(media://images/${images.pointer}.png)`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "contain",
      backgroundPosition: "center",
      border: "none",
      backgroundColor: "transparent"
    };
  }

  return {
    ...base,
    background: color
  };
});

const getMouseImage = (): string => {
  // マウスの状態に応じた画像を返す
  if (props.states && props.states.buttons && props.states.buttons.length > 0) {
    // 左クリック
    if (props.states.buttons.includes(LEFT_BUTTON)) {
      return props.data.images.mouseLeftClick
        ? getStoredImageSource(props.data.images.mouseLeftClick)
        : defaultMouseImages.leftClick;
    }
    // 右クリック
    if (props.states.buttons.includes(RIGHT_BUTTON)) {
      return props.data.images.mouseRightClick
        ? getStoredImageSource(props.data.images.mouseRightClick)
        : defaultMouseImages.rightClick;
    }
    // 中クリック
    if (props.states.buttons.includes(MIDDLE_BUTTON)) {
      return props.data.images.mouseMiddleClick
        ? getStoredImageSource(props.data.images.mouseMiddleClick)
        : defaultMouseImages.middleClick;
    }
  }

  // スクロール
  if (props.states && props.states.type === 2) {
    if (props.states.amount > 0) {
      return props.data.images.mouseScrollUp
        ? getStoredImageSource(props.data.images.mouseScrollUp)
        : defaultMouseImages.scrollUp;
    }
    if (props.states.amount < 0) {
      return props.data.images.mouseScrollDown
        ? getStoredImageSource(props.data.images.mouseScrollDown)
        : defaultMouseImages.scrollDown;
    }
  }

  // デフォルト
  if (props.data.images.mouseDefault) {
    return getStoredImageSource(props.data.images.mouseDefault);
  }

  return defaultMouseImages.default;
};

const mouseImage = computed(() => getMouseImage());

const dropShadowStyle = computed(() =>
  props.data.shadow === false
    ? "none"
    : "drop-shadow(0px 3px 8px rgba(0,0,0,0.45)) drop-shadow(0px 1px 2px rgba(0,0,0,0.35))"
);
</script>

<template>
  <div class="mouse-container" :style="buttonStyle">
  <div class="mouse">
    <img
      v-if="mouseImage"
      :src="mouseImage"
      class="mouse-image"
      :style="{ filter: dropShadowStyle }"
    />
    <div
      v-else
      class="mouse-body"
      :style="{ filter: dropShadowStyle }"
    ></div>
      <template v-if="overlayData">
        <img
          v-if="overlayData.left.default"
          :src="`media://images/${overlayData.left.default}.png`"
          class="mouse-overlay"
          :style="{ filter: dropShadowStyle }"
        />
        <img
          v-if="overlayData.left.active && isButtonDown(LEFT_BUTTON)"
          :src="`media://images/${overlayData.left.active}.png`"
          class="mouse-overlay"
          :style="{ filter: dropShadowStyle }"
        />
        <img
          v-if="overlayData.right.default"
          :src="`media://images/${overlayData.right.default}.png`"
          class="mouse-overlay"
          :style="{ filter: dropShadowStyle }"
        />
        <img
          v-if="overlayData.right.active && isButtonDown(RIGHT_BUTTON)"
          :src="`media://images/${overlayData.right.active}.png`"
          class="mouse-overlay"
          :style="{ filter: dropShadowStyle }"
        />
        <img
          v-if="overlayData.middle.default"
          :src="`media://images/${overlayData.middle.default}.png`"
          class="mouse-overlay"
          :style="{ filter: dropShadowStyle }"
        />
        <img
          v-if="overlayData.middle.active && isButtonDown(MIDDLE_BUTTON)"
          :src="`media://images/${overlayData.middle.active}.png`"
          class="mouse-overlay"
          :style="{ filter: dropShadowStyle }"
        />
      </template>
    </div>
    <div class="pointer-ring" :style="ringStyle">
      <div class="pointer" :style="pointerStyle"></div>
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
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mouse-body {
  width: 100%;
  height: 100%;
  background: #888888;
  border-radius: 8px;
}

.mouse-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.mouse-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.pointer-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  box-sizing: border-box;
  transform-origin: 50% 50%;
  pointer-events: none;
}

.pointer {
  border-radius: 50%;
  transform-origin: 50% 50%;
  position: absolute;
}
</style>
