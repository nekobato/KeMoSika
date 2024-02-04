<script setup lang="ts">
import { useStore } from "@renderer/store";
import Key from "@renderer/components/Key.vue";
import Moveable from "vue3-moveable";

const store = useStore();
</script>

<template>
  <div class="key-layout-config">
    <div class="key-config-item" v-for="key in store.keys">
      <Key
        :key="key.id"
        :id="key.id"
        :keyName="key.key"
        :type="key.type"
        :isDown="false"
        :size="key.size"
        :width="key.width"
        :x="key.x"
        :y="key.y"
      />
    </div>
    <Moveable
      className="moveable"
      :target="['.key-config-item']"
      :draggable="true"
      :scalable="true"
    />
  </div>
</template>

<style scoped lang="scss">
.key-layout-config {
  position: relative;
  overflow: scroll;
  width: 100%;
  height: 100%;

  --dot-bg: #2f3336;
  --dot-color: #84878a;
  --dot-size: 1px;
  --dot-space: 20px;
  background: linear-gradient(
        90deg,
        var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
        transparent 1%
      )
      center / var(--dot-space) var(--dot-space),
    linear-gradient(
        var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
        transparent 1%
      )
      center / var(--dot-space) var(--dot-space),
    var(--dot-color);
}

.key-config-item {
  display: contents;
}
</style>
