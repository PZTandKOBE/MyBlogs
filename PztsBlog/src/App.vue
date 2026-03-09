<template>
  <Portal />
</template>

<script setup lang="ts">
  import Portal from "./views/portal/index.vue";
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}
</style>