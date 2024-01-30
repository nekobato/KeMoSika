<script setup lang="ts">
import KeyboardShortcutInput from "@renderer/components/common/KeyboardShortcutInput.vue";

import { nanoid } from "nanoid/non-secure";
import { nextTick, ref } from "vue";

const list = ref<HTMLUListElement>();

const keys = ref(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => ({
    id: nanoid(),
    key: "A",
    type: "normal",
    x: 0,
    y: 0,
    size: 48,
    width: 48
  }))
);

const emit = defineEmits<{
  (
    e: "change",
    keys: {
      id: string;
      key: string;
      type: string;
      x: number;
      y: number;
      size: number;
      width: number;
    }[]
  ): void;
}>();

const onChangeKey = (index: number, key: string[]) => {
  keys.value[index].key = key[key.length - 1];
};

const onClickAddButton = () => {
  keys.value.push({
    id: nanoid(),
    key: "A",
    type: "normal",
    x: 0,
    y: 0,
    size: 48,
    width: 48
  });

  nextTick(() => {
    list.value?.scrollTo({
      top: list.value.scrollHeight,
      behavior: "smooth"
    });
  });
};
</script>

<template>
  <ul class="key-table-list" ref="list">
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
    <li v-for="(key, index) in keys" :key="key.id">
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
    <li>
      <div class="add-button" @click="onClickAddButton">追加</div>
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

.add-button {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid #2f3336;
  border-radius: 8px;
  color: #2f3336;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #2f3336;
    color: #fff;
  }
}
</style>
