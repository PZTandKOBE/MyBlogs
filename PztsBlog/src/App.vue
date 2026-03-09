<template>
<div class="silk-container">
    <Silk
      :speed="5"
      :scale="1"
      :color="'#5c2f83'"
      :noise-intensity="0.1"
      :rotation="0"
      class="w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
  //背景
  import Silk from "./views/background/Silk.vue"; 

</script>

<style scoped>

</style>