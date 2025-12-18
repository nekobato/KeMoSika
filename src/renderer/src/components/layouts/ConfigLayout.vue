<template>
  <div class="config">
    <div class="header">
      <slot name="header" class="header" />
    </div>
    <div class="main">
      <slot name="main" class="main" />
    </div>
    <div class="aside">
      <slot name="aside" class="aside" />
    </div>
    <slot name="dialog" class="dialog" />
  </div>
</template>
<style lang="scss" scoped>
.config {
  display: grid;
  grid-template-rows: 40px 1fr;
  grid-template-columns: 1fr 320px;
  position: relative;
  width: 100%;
  height: 100vh;
}

.header {
  grid-row: 1;
  grid-column: 1 / 3;
}

.main {
  background-color: var(--color-grey-100);
  grid-row: 2;
  grid-column: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.aside {
  grid-row: 2;
  grid-column: 2;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-grey-700);
  overflow-y: scroll;
}
</style>
