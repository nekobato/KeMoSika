<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const canBack = computed(() => {
  return router.currentRoute.value.path !== "/";
});

const backHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="window-header">
    <button class="nn-button type-ghost exit" v-if="canBack" @click="backHome">
      <Icon icon="mingcute:home-4-line" class="nn-icon size-xsmall" />
    </button>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.window-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: var(--color-grey-800);
  -webkit-app-region: drag;
  width: 100%;
  height: 100%;
}
.nn-button {
  width: 80px;
  height: 24px;
  min-height: auto;
  -webkit-app-region: no-drag;
  &.exit {
    margin: auto auto auto 80px;
  }
}
</style>
