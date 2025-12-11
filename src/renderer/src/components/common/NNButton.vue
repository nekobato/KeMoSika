<script setup lang="ts">
import Button from "primevue/button";

const slots = defineSlots<{
  icon: any;
  default: any;
}>();
</script>

<template>
  <Button class="nn-button" rounded severity="secondary">
    <div class="icon" v-if="slots.icon">
      <slot name="icon" />
    </div>
    <div class="label" v-if="slots.default">
      <slot />
    </div>
  </Button>
</template>
<style scoped lang="scss">
.nn-button {
  height: 40px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
}

.label {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  font-weight: bold;
  padding: 0 8px;
}
</style>
