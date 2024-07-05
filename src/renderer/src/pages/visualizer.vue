<script setup lang="ts">
import { type UiohookKeyboardEvent } from "uiohook-napi";
import { keyCodeMap } from "@renderer/utils";
import KeyboardBase from "../components/KeyboardBase.vue";
import Key from "../components/KeyboardButton.vue";
import { ref } from "vue";
import { useStore } from "@renderer/store";

const store = useStore();

window.ipc.on("input:keydown", (_, e: UiohookKeyboardEvent) => {
  const keyName = keyCodeMap[e.keycode];
  console.log(keyName);
  if (keyName && isDown.value[keyName] !== undefined) {
    isDown.value[keyName] = true;
  }
});

window.ipc.on("input:keyup", (_, e: UiohookKeyboardEvent) => {
  const keyName = keyCodeMap[e.keycode];
  if (keyName && isDown.value[keyName] !== undefined) {
    isDown.value[keyName] = false;
  }
});

const isDown = ref<{ [key: string]: boolean }>({
  a: false,
  d: false,
  s: false,
  w: false
});
</script>

<template>
  <div class="visualizer">
    <KeyboardBase>
      <Key
        v-for="item in store.$state.keys"
        :key="item.id"
        :keyName="item.key"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :size="item.size"
        :isDown="isDown[item.key] || false"
      />
    </KeyboardBase>
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
  padding: 64px;
}
</style>
