<script lang="ts" setup>
import { usePreferredColorScheme, useStorage } from "@vueuse/core";
import { computed, onBeforeMount, onMounted } from "vue";
import { RouterView } from "vue-router";
import { useStore } from "./store";
import { nanoid } from "nanoid/non-secure";

const savedTheme = useStorage("theme", undefined);
const preferredColor = usePreferredColorScheme();

const theme = computed(() => {
  return savedTheme.value || preferredColor.value;
});

const store = useStore();

onBeforeMount(async () => {
  await store.init();
  if (!store.$state.layouts?.length) {
    store.addLayout({
      id: nanoid(),
      name: "Layout 1"
    });
  }
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
