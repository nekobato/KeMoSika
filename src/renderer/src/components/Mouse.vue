<script setup lang="ts">
import { computed, PropType } from "vue";
import { MouseData, MouseState } from "@shared/types";
import {
  DEFAULT_MOUSE_BASE_IMAGE_ID,
  DEFAULT_MOUSE_BUTTON_IMAGE_IDS,
  resolveMouseVisualLayers
} from "./mouseLayers";

const DEFAULT_RING_COLOR = "#ffffff";
const POINTER_SIZE = 16;

/** Resolves an image from the media protocol image store. */
const getStoredImageSource = (imageName: string): string =>
  `media://images/${imageName}.png`;

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

const mouseLayers = computed(() =>
  resolveMouseVisualLayers({
    baseImageId: props.data.images.mouseDefault,
    fallbackBaseImageId: DEFAULT_MOUSE_BASE_IMAGE_ID,
    fallbackButtonImageIds: DEFAULT_MOUSE_BUTTON_IMAGE_IDS,
    buttonOverlays: props.data.buttonOverlays,
    pressedButtons: props.states?.buttons ?? []
  })
);

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

const mouseImage = computed(() =>
  getStoredImageSource(mouseLayers.value.baseImageId)
);

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
        :src="mouseImage"
        class="mouse-image"
        alt=""
        aria-hidden="true"
        :style="{ filter: dropShadowStyle }"
      />
      <img
        v-for="layer in mouseLayers.buttonLayers"
        :key="layer.button"
        :src="`media://images/${layer.imageId}.png`"
        class="mouse-overlay"
        alt=""
        aria-hidden="true"
      />
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

.mouse-image,
.mouse-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mouse-overlay {
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
