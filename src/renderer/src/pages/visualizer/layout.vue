<script setup lang="ts">
import { keyCodeMap } from "@/utils/keyCodes";
import {
  getActiveKeyboardCodes,
  isKeyboardKeyActive
} from "@/utils/keyActivation";
import { computed, ref } from "vue";
import { useStore } from "../../store";
import KeyboardButton from "../../components/KeyboardButton.vue";
import { useRoute } from "vue-router";
import type { LayoutData, LayoutItemData } from "@shared/types";
import type { KeyboardLockState } from "@shared/app-api";
import type { MouseButtonCode, MouseState } from "@shared/types";
import { useMouseMotion } from "@/composables/visualizer/useMouseMotion";
import { useScrollActivity } from "@/composables/visualizer/useScrollActivity";
import { createLayoutBackgroundStyle } from "@/utils/layoutBackground";
import Mouse from "../../components/Mouse.vue";

const route = useRoute();
const store = useStore();

const downKeyCodes = ref<number[]>([]);
const keyboardLockState = ref<KeyboardLockState>({
  capsLock: false,
  numLock: false,
  scrollLock: false,
  revision: -1
});
const mouseButtons = ref<MouseButtonCode[]>([]);
const { motion: mouseMotion, registerPosition: registerMousePosition } =
  useMouseMotion();
const {
  directions: scrollDirections,
  registerDirection: registerScrollDirection
} = useScrollActivity();
const mouseState = computed<MouseState>(() => ({
  buttons: mouseButtons.value,
  scrollDirections: [...scrollDirections.value]
}));

const layout = computed<LayoutData | undefined>(() => {
  const allLayouts = [...store.$state.layouts, ...store.builtinLayouts];
  return allLayouts.find((l) => l.id === route.params.layoutId);
});

const items = computed<LayoutItemData[]>(() => layout.value?.keys ?? []);

const layoutBackgroundStyle = computed(() =>
  createLayoutBackgroundStyle(layout.value?.background)
);

const downKeys = computed<string[]>(() =>
  downKeyCodes.value
    .map((keyCode) => keyCodeMap[keyCode])
    .filter((code): code is string => code !== undefined)
);

const activeKeys = computed<string[]>(() =>
  getActiveKeyboardCodes(downKeys.value, keyboardLockState.value)
);
const shiftPressed = computed(() => downKeys.value.includes("shift"));
const capsLockActive = computed(() => keyboardLockState.value.capsLock);

const applyKeyboardLockState = (state: KeyboardLockState): void => {
  if (state.revision >= keyboardLockState.value.revision) {
    keyboardLockState.value = state;
  }
};

window.kemosikaApi.onKeyboardLockState(applyKeyboardLockState);
void window.kemosikaApi
  .getKeyboardLockState()
  .then(applyKeyboardLockState)
  .catch((error) => {
    console.error("keyboard lock-state fetch failed", error);
  });

window.kemosikaApi.onInput((event) => {
  switch (event.kind) {
    case "key":
      if (event.action === "pressed") {
        if (
          keyCodeMap[event.keycode] !== undefined &&
          !downKeyCodes.value.includes(event.keycode)
        ) {
          downKeyCodes.value.push(event.keycode);
        }
      } else {
        downKeyCodes.value = downKeyCodes.value.filter(
          (keyCode) => keyCode !== event.keycode
        );
      }
      break;
    case "mouse-button":
      if (event.action === "pressed") {
        if (!mouseButtons.value.includes(event.button)) {
          mouseButtons.value.push(event.button);
        }
      } else {
        mouseButtons.value = mouseButtons.value.filter(
          (button) => button !== event.button
        );
      }
      break;
    case "mouse-move":
      registerMousePosition(event.x, event.y);
      break;
    case "scroll":
      registerScrollDirection(event.direction);
      break;
  }
});
</script>

<template>
  <div class="visualizer" :style="layoutBackgroundStyle">
    <template v-for="item in items" :key="item.id">
      <KeyboardButton
        v-if="item.type === 'key'"
        :key-data="item"
        :shift-pressed="shiftPressed"
        :caps-lock-active="capsLockActive"
        :is-down="
          isKeyboardKeyActive(
            item.codeMap,
            activeKeys,
            item.activationMode ?? 'any'
          )
        "
      />
      <Mouse
        v-else
        :data="item"
        :states="mouseState"
        :motion="mouseMotion"
      />
    </template>
  </div>
</template>

<style scoped>
.visualizer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--layout-background-color, #252525);
  background-image: var(--layout-background-image, none);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}
.button {
  &.type-back {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
</style>
