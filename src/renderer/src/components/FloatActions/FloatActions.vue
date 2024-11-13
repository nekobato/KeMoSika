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
  /* glassmorphic */
  background: var(--color-black-t500);
  border-radius: 8px;
  box-shadow: 0 4px 32px var(--color-black-t300);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-white-t200);
}
</style>
