<script lang="ts" setup>
import Button from "primevue/button";

const props = defineProps<{
  label?: string;
}>();
</script>
<template>
  <Button class="nn-button" text severity="secondary">
    <slot name="icon" />
    <span class="label" v-if="props.label">{{ props.label }}</span>
  </Button>
</template>

<style lang="scss" scoped>
.nn-button {
  border-radius: 0;
  cursor: pointer;
  &:not(:first-of-type) {
    margin-left: 1px;
  }

  .label {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
:slotted(.icon) {
  margin: auto auto auto 0;
}
</style>
