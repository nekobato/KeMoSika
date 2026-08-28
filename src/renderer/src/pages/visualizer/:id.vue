<script setup lang="ts">
import type {
  UiohookMouseEvent,
  UiohookWheelEvent,
  UiohookKeyboardEvent
} from "uiohook-napi";
import { InputEventType } from "@/utils/uioHook";
import { keyCodeMap } from "@/utils/keyCodes";
import {
  getActiveKeyboardCodes,
  isKeyboardKeyActive
} from "@/utils/keyActivation";
import { computed, ref } from "vue";
import { useStore } from "../../store";
import KeyboardButton from "../../components/KeyboardButton.vue";
import { useRoute } from "vue-router";
import { KeyboardKeyData, LayoutData, MouseData } from "@shared/types";
import type { KeyboardLockState } from "@shared/app-api";
import type { MouseButtonCode } from "@shared/types";
import { isMouseButtonCode } from "@/utils/mouseButtons";
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
const mouseStates = ref({
  from: {
    x: 0,
    y: 0
  },
  to: {
    x: 0,
    y: 0
  },
  buttons: [] as MouseButtonCode[],
  type: 0,
  amount: 0
});

const layout = computed<LayoutData | undefined>(() => {
  const allLayouts = [...store.$state.layouts, ...store.builtinLayouts];
  return allLayouts.find((l) => l.id === route.params.layoutId);
});

const keys = computed<KeyboardKeyData[] | undefined>(() =>
  layout.value?.keys.filter((key) => key.type === "key")
);

const mouses = computed<MouseData[] | undefined>(() => {
  return layout.value?.keys.filter((key) => key.type === "mouse");
});

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
  const e = event as
    | UiohookKeyboardEvent
    | UiohookMouseEvent
    | UiohookWheelEvent;
  switch (e.type) {
    case InputEventType.EVENT_KEY_PRESSED:
      if (
        keyCodeMap[e.keycode] !== undefined &&
        !downKeyCodes.value.includes(e.keycode)
      ) {
        downKeyCodes.value.push(e.keycode);
      }
      break;
    case InputEventType.EVENT_KEY_RELEASED:
      downKeyCodes.value = downKeyCodes.value.filter(
        (keyCode) => keyCode !== e.keycode
      );
      break;
    case InputEventType.EVENT_MOUSE_PRESSED:
      if (
        isMouseButtonCode(e.button) &&
        !mouseStates.value.buttons.includes(e.button)
      ) {
        mouseStates.value.buttons.push(e.button);
      }
      break;
    case InputEventType.EVENT_MOUSE_RELEASED:
      if (isMouseButtonCode(e.button)) {
        mouseStates.value.buttons = mouseStates.value.buttons.filter(
          (button) => button !== e.button
        );
      }
      break;
    case InputEventType.EVENT_MOUSE_MOVED:
      mouseStates.value.from.x = mouseStates.value.to.x;
      mouseStates.value.from.y = mouseStates.value.to.y;
      mouseStates.value.to.x = e.x;
      mouseStates.value.to.y = e.y;
      break;
    case InputEventType.EVENT_MOUSE_WHEEL:
      mouseStates.value.amount = e.amount;
      break;
  }
});
</script>

<template>
  <div class="visualizer">
    <KeyboardButton
      v-for="keyData in keys"
      :key-data="keyData"
      :shift-pressed="shiftPressed"
      :caps-lock-active="capsLockActive"
      :is-down="
        isKeyboardKeyActive(
          keyData.codeMap,
          activeKeys,
          keyData.activationMode ?? 'any'
        )
      "
    />
    <Mouse v-for="mouse in mouses" :data="mouse" :states="mouseStates" />
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
  background-color: #00ff00;
}
.button {
  &.type-back {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
</style>
