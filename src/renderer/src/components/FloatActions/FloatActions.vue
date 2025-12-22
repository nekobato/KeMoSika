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

:deep(.float-action-button) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 0.75rem;
}

:deep(.float-action-button .action-icon) {
  font-size: 1rem;
}

:deep(.float-action-button .action-label) {
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
