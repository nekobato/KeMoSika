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
  background: var(--color-black-t500);
  border-radius: 8px;
  box-shadow: 0 4px 32px var(--color-black-t300);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-white-t200);
  overflow: hidden;

  :deep(.float-action-button) {
    background: transparent;
    border: none;
    border-radius: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 10px;
    min-width: 48px;
  }

  :deep(.float-action-button:not(:first-of-type)) {
    border-left: 1px solid var(--color-white-t200);
  }

  :deep(.float-action-button:hover) {
    background-color: var(--color-white-t50);
  }

  :deep(.float-action-button:focus-visible) {
    outline: 2px solid var(--color-white-t200);
    outline-offset: -2px;
  }

  :deep(.action-icon) {
    color: var(--color-grey-50);
  }

  :deep(.add-icon) {
    width: 10px;
    height: 10px;
  }

  :deep(.float-action-button.type-primary) {
    width: 80px;
  }
}
</style>
