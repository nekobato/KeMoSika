<script setup lang="ts">
import Key from "@renderer/components/Key.vue";
import { useStore } from "@renderer/store";
import { watchArray } from "@vueuse/core";
import { onMounted, ref } from "vue";
import Moveable from "vue3-moveable";

const store = useStore();
const moveableRef = ref<Moveable>();

const onDrag = (payload) => {
  console.log(payload);
};
// const onScale = ({ drag }) => {
//   this.$refs.target.style.transform = drag.transform;
// };

// const onRotate = ({ drag }) => {
//   this.$refs.target.style.transform = drag.transform;
// };

watchArray(
  () => store.$state.keys,
  () => {
    console.log("update");
    moveableRef.value?.updateSelectors();
  }
);

onMounted(() => {
  console.log("mounted");
  console.log(store.$state);
});
</script>

<template>
  <div class="key-layout-config">
    <Key
      class="key-config-item"
      v-for="key in store.$state.keys"
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
    <Moveable
      ref="moveableRef"
      :target="['.key-config-item']"
      :dragTarget="`.key-config-item`"
      :draggable="true"
      @drag="onDrag"
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
</style>
