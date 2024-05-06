<script setup lang="ts">
import Key from "@renderer/components/Key.vue";
import { ref } from "vue";
import Moveable from "vue3-moveable";

defineProps<{
  index: number;
  ke: {
    id: string;
    key: string;
    type: string;
    size: number;
    width: number;
    x: number;
    y: number;
  };
}>();

const emit = defineEmits(["drag"]);

const moveableRef = ref<Moveable>();
</script>

<template>
  <div class="configurable-key">
    <Key
      class="key"
      :id="`key-${ke.id}`"
      :keyName="ke.key"
      :type="ke.type"
      :isDown="false"
      :size="ke.size"
      :width="ke.width"
      :x="ke.x"
      :y="ke.y"
    />
    <Moveable
      ref="moveableRef"
      :target="`#key-${ke.id}`"
      :dragTarget="`#key-${ke.id}`"
      :draggable="true"
      :scalable="false"
      :rotatable="false"
      :roundable="false"
      :origin="false"
      @drag="emit('drag', index, $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.configurable-key {
  display: contents;
  cursor: grab;
}
</style>
