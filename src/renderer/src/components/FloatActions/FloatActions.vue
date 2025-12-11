<template>
  <div class="float-actions">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.float-actions {
  position: fixed;
  bottom: 24px;
  display: inline-flex;
  margin: auto;
  backdrop-filter: blur(8px);
  overflow: hidden;
}
</style>
