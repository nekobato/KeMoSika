<script setup lang="ts">
import KeyboardShortcutInput from "@renderer/components/common/KeyboardShortcutInput.vue";

const props = defineProps({
  keys: {
    type: Array<{
      id: string;
      key: string;
      type: string;
      x: number;
      y: number;
      size: number;
      width: number;
    }>,
    required: true
  }
});

const onChangeKey = (index: number, key: string[]) => {
  props.keys[index].key = key[key.length - 1];
};
</script>

<template>
  <ul class="key-table-list">
    <li>
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
    </li>
    <li v-for="(key, index) in props.keys" :key="key.id">
      <div class="key-table-list-item">
        <div class="column name">
          <KeyboardShortcutInput
            class="nn-text-field"
            :value="[key.key]"
            @change="onChangeKey(index, $event)"
          />
        </div>
        <div class="column type">
          <select class="nn-select" :value="key.type">
            <option value="normal">ノーマル</option>
            <option value="enter">エンター</option>
          </select>
        </div>
        <div class="column x">
          <input
            type="number"
            class="nn-text-field align-right"
            :value="key.x"
          />
        </div>
        <div class="column y">
          <input
            type="number"
            class="nn-text-field align-right"
            :value="key.y"
          />
        </div>
        <div class="column size">
          <input
            type="number"
            class="nn-text-field align-right"
            :value="key.size"
          />
        </div>
        <div class="column width">
          <input
            type="number"
            class="nn-text-field align-right"
            :value="key.width"
          />
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.key-table-list {
  display: flex;
  flex: 0 0 auto;
  gap: 4px;
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
    flex-shrink: 0;
    width: 100%;
    height: 40px;
  }
}

.key-table-list-header,
.key-table-list-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 0 16px;
  gap: 16px;
  background: #2f3336;

  .column {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100%;

    &.name {
      width: 80px;
    }

    &.type {
      width: 128px;
    }

    &.x,
    &.y,
    &.size,
    &.width {
      width: 64px;
    }
  }
}

.key-table-list-header {
  font-size: 14px;
}

.nn-text-field {
  width: 100%;
  height: 32px;
}
</style>
