<script setup lang="ts">
import KeyTableListItem from "./KeyTableListItem.vue";

const props = defineProps({
  keys: {
    type: Array<{
      id: number;
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }>,
    required: true
  }
});
</script>

<template>
  <ul class="key-table-list">
    <li v-for="key in props.keys" :key="key.id">
      <KeyTableListItem />
    </li>
  </ul>
</template>

<style scoped lang="scss">
.key-table-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  padding: 16px;
  margin: 0;

  > li {
    width: 100%;
    height: 40px;
  }
}
</style>
