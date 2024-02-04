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
  background: #e6e6e6;
  border: 2px solid #ebebeb;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background: #d4d4d4;
  }
}

.icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background: #333333;
}

.label {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  font-weight: bold;
  color: #444444;
  padding: 0 16px;
}
</style>
