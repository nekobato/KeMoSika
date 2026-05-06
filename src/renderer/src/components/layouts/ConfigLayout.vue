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
  grid-template-columns: minmax(0, 1fr) 336px;
  position: relative;
  width: 100%;
  height: 100vh;
  background: #191919;
}

.header {
  grid-row: 1;
  grid-column: 1 / 3;
  box-shadow: inset 0 -1px rgba(255, 255, 255, 0.08);
  z-index: 50;
}

.main {
  background-color: #c9ccd2;
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
  background-color: #242629;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
</style>
