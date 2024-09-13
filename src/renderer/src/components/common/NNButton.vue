<script setup lang="ts">
const slots = defineSlots<{
  icon: any;
  default: any;
}>();
</script>

<template>
  <button class="button">
    <div class="icon" v-if="slots.icon">
      <slot name="icon" />
    </div>
    <div class="label" v-if="slots.default">
      <slot />
    </div>
  </button>
</template>
<style scoped lang="scss">
.button {
  height: 40px;
  padding: 0 8px;
  border-radius: 20px;
  background: #ece5d8;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #454545;
  border: none;

  &:hover {
    background: #e5e5e5;
  }
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
  padding: 0 16px;
}
</style>
