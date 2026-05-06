<template>
  <div class="float-actions">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.float-actions {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 40;
  display: inline-flex;
  max-width: calc(100vw - 32px);
  overflow: hidden;
  background: rgba(25, 25, 25, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
  transform: translateX(-50%);
  backdrop-filter: blur(12px);
}

:deep(.p-buttongroup) {
  display: flex;
  min-width: 0;
}

:deep(.float-action-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 108px;
  height: 40px;
  padding: 0 12px;
  color: #eaf6f8;
  background: rgba(31, 33, 36, 0.94);
  border-color: rgba(255, 255, 255, 0.12);
  border-radius: 0;
  white-space: nowrap;

  &:enabled:hover {
    color: #ffffff;
    background: rgba(103, 199, 217, 0.16);
    border-color: rgba(103, 199, 217, 0.48);
  }

  &.type-primary {
    color: #061316;
    background: #67c7d9;
    border-color: #67c7d9;

    &:enabled:hover {
      color: #061316;
      background: #8dd8e6;
      border-color: #8dd8e6;
    }
  }
}

:deep(.float-action-button .action-icon) {
  flex: 0 0 auto;
  font-size: 16px;
}

:deep(.float-action-button .action-label) {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-overflow: ellipsis;
}
</style>
