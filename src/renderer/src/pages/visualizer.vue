<script setup lang="ts">
import type {
  UiohookMouseEvent,
  UiohookWheelEvent,
  UiohookKeyboardEvent
} from "uiohook-napi";
import { InputEventType } from "@/utils/uioHook";
import { keyCodeMap } from "@/utils/key";
import { computed, ref } from "vue";
import { useStore } from "../store";
import KeyboardButton from "../components/KeyboardButton.vue";
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { KeyboardKeyData } from "@shared/types";
import { onBeforeUnmount } from "vue";
import Mouse from "../components/Mouse.vue";

const router = useRouter();
const store = useStore();

const downKeys = ref<string[]>([]);
const mouseStates = ref({
  from: {
    x: 0,
    y: 0
  },
  to: {
    x: 0,
    y: 0
  },
  buttons: [] as number[],
  type: 0,
  amount: 0
});

const keys = computed<KeyboardKeyData[]>(() =>
  store.$state.layouts[store.$state.activeLayoutIndex]?.keys.filter(
    (key) => key.type === "key"
  )
);

const mouses = computed(() => {
  return store.$state.layouts[store.$state.activeLayoutIndex]?.keys.filter(
    (key) => key.type === "mouse"
  );
});

const isDown = (codes: string[]) => {
  return codes.some((code) => downKeys.value.includes(code));
};

window.ipc.on(
  "input",
  (_, e: UiohookKeyboardEvent | UiohookMouseEvent | UiohookWheelEvent) => {
    console.log(e);
    switch (e.type) {
      case InputEventType.EVENT_KEY_PRESSED:
        downKeys.value.push(keyCodeMap[e.keycode]);
        break;
      case InputEventType.EVENT_KEY_RELEASED:
        downKeys.value = downKeys.value.filter(
          (key) => key !== keyCodeMap[e.keycode]
        );
        break;
      case InputEventType.EVENT_MOUSE_PRESSED:
        mouseStates.value.buttons.push(e.button as number);
        break;
      case InputEventType.EVENT_MOUSE_RELEASED:
        mouseStates.value.buttons = mouseStates.value.buttons.filter(
          (button) => button !== e.button
        );
        break;
      case InputEventType.EVENT_MOUSE_MOVED:
        console.log(e);
        mouseStates.value.from.x = mouseStates.value.to.x;
        mouseStates.value.from.y = mouseStates.value.to.y;
        mouseStates.value.to.x = e.x;
        mouseStates.value.to.y = e.y;
        break;
      case InputEventType.EVENT_MOUSE_WHEEL:
        mouseStates.value.amount = e.amount;
        break;
    }
  }
);

const back = () => {
  router.back();
};

onMounted(async () => {
  await window.ipc.invoke("uiohook:start");
});

onBeforeUnmount(async () => {
  await window.ipc.invoke("uiohook:stop");
});
</script>

<template>
  <div class="visualizer">
    <KeyboardButton
      v-for="keyData in keys"
      :key-data="keyData"
      :is-down="isDown(keyData.codeMap)"
    />
    <Mouse v-for="mouse in mouses" :data="mouse" :states="mouseStates" />
    <button @click="back" class="button type-back">BACK</button>
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
  background: #272b2c;
}
.button {
  &.type-back {
    position: absolute;
    bottom: 16px;
    right: 16px;
  }
}
</style>
