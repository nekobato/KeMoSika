<script setup lang="ts">
import { useStore } from "@/store";
import { OnDrag } from "vue3-moveable";
import ConfigurableKey from "./ConfigurableKey.vue";

const store = useStore();

const onDragKe = (index: number, e: OnDrag) => {
  const key = store.$state.keys[index];
  if (key) {
    key.x = e.left;
    key.y = e.top;
  }
};
</script>

<template>
  <div class="key-layout-config">
    <ConfigurableKey
      v-for="(key, index) in store.$state.keys"
      :key="key.id"
      :index="index"
      :ke="key"
      @drag="onDragKe"
    />
  </div>
</template>

<style scoped lang="scss">
.key-layout-config {
  position: relative;
  overflow: scroll;
  width: 100%;
  height: 100%;
}
</style>
