<script setup lang="ts"></script>

<template>
  <div class="key-table-list-header">
    <div class="column name">
      <span>キー</span>
    </div>
    <div class="column type">
      <span>タイプ</span>
    </div>
    <div class="column x">
      <span>X</span>
    </div>
    <div class="column y">
      <span>Y</span>
    </div>
    <div class="column size">
      <span>サイズ</span>
    </div>
    <div class="column width">
      <span>ヨコハバ</span>
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
