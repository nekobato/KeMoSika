<script setup lang="ts">
import { type UiohookKeyboardEvent } from "uiohook-napi";
import { keyCodeMap } from "@renderer/utils";
import KeyboardBase from "../components/KeyboardBase.vue";
import { ref } from "vue";
import { useStore } from "../store";
import KeyboardButton from "../components/KeyboardButton.vue";
import router from "../router";

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

const back = () => {
  router.replace("/config");
};
</script>

<template>
  <div class="visualizer">
    <KeyboardBase>
      <KeyboardButton
        v-for="item in store.$state.keys"
        :keyData="item.keyData"
        :isDown="isDown[item.keyData.character.toLocaleLowerCase()] || false"
      />
    </KeyboardBase>
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
