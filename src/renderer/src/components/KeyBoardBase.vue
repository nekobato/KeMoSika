<script setup lang="ts"></script>

<template>
  <div class="base">
    <slot></slot>
  </div>
</template>

<style scoped>
.base {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: #272b2c;
  display: flex;
  flex-direction: column;
  padding: 30px 15px;
  font: 28px arial;
  animation: rotateBase 10s linear infinite;
}

@keyframes rotateBase {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(360deg);
  }
}
</style>
