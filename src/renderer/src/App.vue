<script setup lang="ts">
import { onMounted } from "vue";
import Visualizer from "./components/Visualizer.vue";

onMounted(async () => {
  window.removeLoading();
});
</script>

<template>
  <Visualizer />
</template>

<style scoped></style>
