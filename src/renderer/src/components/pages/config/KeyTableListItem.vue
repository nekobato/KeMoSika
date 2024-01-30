<script setup lang="ts"></script>

<template>
  <div class="key-table-list-item">
    <div class="column name">
      <input type="text" class="nn-text-field" />
    </div>
    <div class="column type">
      <input type="text" class="nn-text-field" />
    </div>
    <div class="column x">
      <input type="number" class="nn-text-field" />
    </div>
    <div class="column y">
      <input type="number" class="nn-text-field" />
    </div>
    <div class="column size">
      <input type="number" class="nn-text-field" />
    </div>
    <div class="column width">
      <input type="number" class="nn-text-field" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.key-table-list-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: #2f3336;
}

.column {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding-left: 8px;
}

.name {
  width: 128px;
}

.x,
.y {
  width: 64px;
}

.nn-text-field {
  width: 100%;
}
</style>
