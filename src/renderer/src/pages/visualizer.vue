<script setup lang="ts">
import { type UiohookKeyboardEvent } from "uiohook-napi";
import { keyCodeMap } from "@/utils/key";
import KeyboardBase from "@/components/KeyboardBase.vue";
import { ref } from "vue";
import { useStore } from "../store";
import KeyboardButton from "../components/KeyboardButton.vue";
import router from "../router";
import { onMounted } from "vue";

const store = useStore();

const downKeys = ref<string[]>([]);

const isDown = (codes: string[]) => {
  return codes.some((code) => downKeys.value.includes(code));
};

window.ipc.on("input:keydown", (_, e: UiohookKeyboardEvent) => {
  const keyName = keyCodeMap[e.keycode];
  console.log(keyName);
  if (keyName && downKeys.value.indexOf(keyName) === -1) {
    downKeys.value.push(keyName);
  }
});

window.ipc.on("input:keyup", (_, e: UiohookKeyboardEvent) => {
  const keyName = keyCodeMap[e.keycode];
  if (keyName) {
    downKeys.value = downKeys.value.filter((key) => key !== keyName);
  }
});

const back = () => {
  router.push("/config");
};

onMounted(() => {});
</script>

<template>
  <div class="visualizer">
    <KeyboardBase>
      <KeyboardButton
        v-for="item in store.activeLayout.keys"
        :keyData="item"
        :isDown="isDown(item.codeMap)"
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
