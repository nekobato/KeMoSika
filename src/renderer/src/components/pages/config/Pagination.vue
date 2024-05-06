<script setup lang="ts">
import PaginationItem from "@renderer/svg/pagination-item.svg";
</script>

<template>
  <div class="pagination">
    <button class="item-button active">
      <PaginationItem class="item-icon" />
    </button>
    <button class="item-button">
      <PaginationItem class="item-icon" />
    </button>
    <button class="item-button">
      <PaginationItem class="item-icon" />
    </button>
    <button class="item-button">
      <PaginationItem class="item-icon" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.pagination {
  position: absolute;
  margin: auto;
  top: 16px;
  display: inline-flex;
  gap: 8px;
}

.item-button {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  background: transparent;
  border: none;
  padding: 0;
  &.active {
    &:before {
      content: "";
      display: inline-flex;
      position: absolute;
      top: calc(50% - 22px);
      left: calc(50% - 22px);
      width: 44px;
      height: 44px;
      background: radial-gradient(
        50% 50% at 50% 50%,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      mix-blend-mode: overlay;
    }
    .item-icon {
      position: relative;
      fill: #ffffff;
    }
  }
}

.item-icon {
  color: #ffffff;
  fill: transparent;
}
</style>
