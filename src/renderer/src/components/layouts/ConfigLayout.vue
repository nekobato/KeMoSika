<template>
  <div class="config">
    <slot />
  </div>
</template>
<style lang="scss" scoped>
.config {
  display: grid;
  grid-template-rows: 40px 1fr;
  position: relative;
  width: 100%;
  height: 100vh;
}
</style>
