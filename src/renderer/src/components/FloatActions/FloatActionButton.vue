<script lang="ts" setup>
const props = defineProps<{
  label?: string;
}>();
</script>
<template>
  <button class="nn-button type-ghost">
    <slot name="icon" />
    <span class="label" v-if="props.label">{{ props.label }}</span>
  </button>
</template>

<style lang="scss" scoped>
.nn-button {
  border-radius: 0;
  cursor: pointer;
  &:hover {
    background-color: var(--color-white-t50);
  }
  &:not(:first-of-type) {
    border-left: 1px solid var(--color-white-t50);
  }

  .label {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:has(:not(*)) {
      display: none;
    }
  }
}
:slotted(.icon) {
  color: var(--color-grey-50);
  margin: auto auto auto 0;
}
</style>
