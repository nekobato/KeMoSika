<template>
  <div class="config">
    <slot />
  </div>
</template>
<style lang="scss" scoped>
.config {
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr;
  width: 100%;
  height: 100vh;
}
</style>
