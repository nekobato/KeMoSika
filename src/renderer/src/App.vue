<script lang="ts" setup>
import { usePreferredColorScheme, useStorage } from "@vueuse/core";
import { computed, onBeforeMount, onMounted } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useStore } from "./store";

const savedTheme = useStorage("theme", undefined);
const preferredColor = usePreferredColorScheme();

const theme = computed(() => {
  return savedTheme.value || preferredColor.value;
});

const router = useRouter();

const store = useStore();

onBeforeMount(async () => {
  await store.init();
  if (!store.$state.layouts?.length) {
    store.addLayout();
  }
});

router.afterEach(() => {
  store.init();
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
