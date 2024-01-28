<script setup lang="ts">
import { type UiohookKeyboardEvent } from "uiohook-napi";
import { keyCodeMap } from "@renderer/utils";
import KeyBoardBase from "../components/KeyBoardBase.vue";
import Key from "../components/Key.vue";
import { ref } from "vue";

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
    <KeyBoardBase>
      <Key :is-down="isDown.w" key-name="W" :x="72" :y="0" />
      <Key :is-down="isDown.a" key-name="A" :x="0" :y="72" />
      <Key :is-down="isDown.s" key-name="S" :x="72" :y="72" />
      <Key :is-down="isDown.d" key-name="D" :x="144" :y="72" />
    </KeyBoardBase>
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
