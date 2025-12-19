<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  value: {
    type: Array<string>,
    required: true
  }
});

const emit = defineEmits<{
  (e: "change", key: string[]): void;
}>();

const shortcutInput = ref<HTMLInputElement>();

const keyboardEventToKeyArray = (e: KeyboardEvent): string[] => {
  const shortcut: string[] = [];
  if (e.metaKey) {
    shortcut.push("Meta");
  }
  if (e.ctrlKey) {
    shortcut.push("Ctrl");
  }
  if (e.altKey) {
    shortcut.push("Alt");
  }
  if (e.shiftKey) {
    shortcut.push("Shift");
  }
  switch (e.key) {
    case " ":
      shortcut.push("Space");
      break;
    case "+":
      shortcut.push("Plus");
      break;
    default:
      if (/Key[A-Z]/.test(e.code)) {
        shortcut.push(e.code.replace("Key", ""));
      } else if (/Arrow.+/.test(e.key)) {
        shortcut.push(e.key.replace("Arrow", ""));
      } else {
        shortcut.push(e.key);
      }
      break;
  }
  return shortcut;
};

const onKeyDownOnShortcut = async (e: KeyboardEvent) => {
  const shortcut = keyboardEventToKeyArray(e);

  if (shortcut.length === 0 || shortcut === props.value) {
    return;
  }

  emit("change", shortcut);
};

const focusShortcutInput = () => {
  shortcutInput.value?.focus();
};
</script>

<template>
  <input
    ref="shortcutInput"
    id="shortcut"
    type="text"
    readonly
    :value="value"
    @keydown.prevent="onKeyDownOnShortcut"
    @click="focusShortcutInput"
  />
</template>
