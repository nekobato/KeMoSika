<script setup lang="ts">
import { onMounted } from "vue";
import Visualizer from "./pages/visualizer.vue";
// import Config from "./pages/config.vue";

onMounted(async () => {
  window.removeLoading();
});
</script>

<template>
  <Visualizer />
</template>

<style scoped></style>
