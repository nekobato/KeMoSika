<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";

const router = useRouter();

window.ipc.on(
  "visualizer:start",
  (
    _,
    options: {
      layoutId: string;
      size: { width: number; height: number };
    }
  ) => {
    router.replace(`/visualizer/${options.layoutId}`);
  }
);
</script>

<template>
  <div class="visualizer-home">
    <Icon class="icon" icon="mingcute:keyboard-line" width="24" height="24" />
  </div>
</template>

<style scoped>
.visualizer-home {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #272b2c;
}

.icon {
  color: var(--color-grey-50);
}
</style>
