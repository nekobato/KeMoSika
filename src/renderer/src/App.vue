<script lang="ts" setup>
import { usePreferredColorScheme, useStorage } from "@vueuse/core";
import { computed, onMounted } from "vue";
import { RouterView } from "vue-router";

const savedTheme = useStorage("theme", undefined);
const preferredColor = usePreferredColorScheme();

const theme = computed(() => {
  return savedTheme.value || preferredColor.value;
});

onMounted(() => {
  window.removeLoading();
});
</script>

<template>
  <div class="theme" :class="[theme]">
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.theme {
  display: contents;
}
</style>
