<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";

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
    <Button
      v-if="canBack"
      class="nn-button exit"
      severity="secondary"
      text
      @click="backHome"
      aria-label="Home"
    >
      <Icon icon="mingcute:home-4-line" class="nn-icon" />
    </Button>
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
