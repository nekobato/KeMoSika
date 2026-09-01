<script setup lang="ts">
import { computed } from "vue";
import type {
  MouseData,
  MouseState,
  ScrollDirection
} from "@shared/types";
import { DEFAULT_MOUSE_SPEED_SENSITIVITY } from "@/constants/mouseMotion";
import {
  MOUSE_MOTION_SETTLED_SPEED,
  MOUSE_TRAIL_LAYERS,
  RESTING_MOUSE_MOTION,
  speedToProgress,
  type MouseMotionPose,
  type MouseMotionVisualState
} from "@/utils/mouseMotion";
import {
  DEFAULT_MOUSE_BASE_IMAGE_ID,
  DEFAULT_MOUSE_BUTTON_IMAGE_IDS,
  resolveMouseVisualLayers
} from "./mouseLayers";
import {
  SCROLL_INDICATOR_DIRECTIONS,
  getScrollIndicatorGeometry
} from "@/utils/scrollIndicator";

const DEFAULT_RING_COLOR = "#ffffff";
const POINTER_SIZE = 16;

/** Resolves an image from the media protocol image store. */
const getStoredImageSource = (imageName: string): string =>
  `media://images/${imageName}.png`;

const props = defineProps<{
  data: MouseData;
  states?: MouseState;
  motion?: MouseMotionVisualState;
}>();

const ringData = computed(() => ({
  size:
    props.data.ring?.size ??
    Math.max(props.data.width ?? 0, props.data.height ?? 0),
  color: props.data.ring?.color ?? DEFAULT_RING_COLOR,
  speedSensitivity:
    props.data.ring?.speedSensitivity ?? DEFAULT_MOUSE_SPEED_SENSITIVITY,
  images: {
    ring: props.data.ring?.images?.ring ?? "",
    pointer: props.data.ring?.images?.pointer ?? ""
  }
}));

const motionState = computed(() => props.motion ?? RESTING_MOUSE_MOTION);

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
  const style: Record<string, string> = {
    width: `${size}px`,
    height: `${size}px`,
    transform: "translate(-50%, -50%)"
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

const pointerStyle = computed<Record<string, string>>(() => {
  const { color, images } = ringData.value;
  const base = {
    width: `${POINTER_SIZE}px`,
    height: `${POINTER_SIZE}px`
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
    background: color,
    borderRadius: "50%"
  };
});

const getPointerTrackStyle = (
  pose: MouseMotionPose,
  opacity: number
): Record<string, string> => {
  const { size, speedSensitivity } = ringData.value;
  const maximumDistance = Math.max(0, size / 2 - POINTER_SIZE / 2);
  const distance = maximumDistance * speedToProgress(pose.speed, speedSensitivity);
  const itemRotation = (props.data.rotation * Math.PI) / 180;

  return {
    "--pointer-distance": `${distance}px`,
    transform: `rotate(${pose.angle - itemRotation}rad)`,
    opacity: `${pose.speed >= MOUSE_MOTION_SETTLED_SPEED ? opacity : 0}`
  };
};

const pointerTrackStyle = computed(() => {
  const style = getPointerTrackStyle(motionState.value.current, 1);
  return { ...style, opacity: "1" };
});

const trailTrackStyles = computed(() =>
  motionState.value.trail.map((pose, index) => ({
    delay: MOUSE_TRAIL_LAYERS[index]?.delay ?? index,
    style: getPointerTrackStyle(
      pose,
      MOUSE_TRAIL_LAYERS[index]?.opacity ?? 0
    )
  }))
);

const getScrollIndicatorTrackStyle = (
  direction: ScrollDirection
): Record<string, string> => {
  const geometry = getScrollIndicatorGeometry({
    direction,
    ringSize: ringData.value.size,
    itemRotation: props.data.rotation
  });

  return {
    "--scroll-indicator-offset": `${geometry.offset}px`,
    "--scroll-indicator-length": `${geometry.length}px`,
    "--scroll-indicator-thickness": `${geometry.thickness}px`,
    transform: `rotate(${geometry.angle}rad)`
  };
};

const scrollIndicatorTracks = computed(() =>
  SCROLL_INDICATOR_DIRECTIONS.map((direction) => ({
    direction,
    active: props.states?.scrollDirections.includes(direction) ?? false,
    style: getScrollIndicatorTrackStyle(direction)
  }))
);

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
      <div
        v-for="indicator in scrollIndicatorTracks"
        :key="indicator.direction"
        class="scroll-track"
        :class="{ 'is-active': indicator.active }"
        :style="indicator.style"
        aria-hidden="true"
      >
        <div class="scroll-marker"></div>
      </div>
      <div
        v-for="trail in trailTrackStyles"
        :key="trail.delay"
        class="pointer-track is-trail"
        :style="trail.style"
      >
        <div class="pointer" :style="pointerStyle"></div>
      </div>
      <div class="pointer-track" :style="pointerTrackStyle">
        <div class="pointer" :style="pointerStyle"></div>
      </div>
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
  --scroll-indicator-color: #62d4ff;

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

.scroll-track {
  position: absolute;
  inset: 0;
  transform-origin: 50% 50%;
  pointer-events: none;
}

.scroll-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--scroll-indicator-length);
  height: var(--scroll-indicator-thickness);
  border-radius: 999px;
  background: var(--scroll-indicator-color);
  opacity: 0;
  transform: translate(-50%, -50%)
    translateX(var(--scroll-indicator-offset)) rotate(90deg);
  transition: opacity 80ms ease-out;
}

.scroll-track.is-active .scroll-marker {
  opacity: 0.75;
}

.pointer-track {
  position: absolute;
  inset: 0;
  transform-origin: 50% 50%;
}

.pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateX(var(--pointer-distance));
}

.pointer-track.is-trail {
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .scroll-marker {
    transition: none !important;
  }
}
</style>
