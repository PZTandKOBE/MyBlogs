<template>
  <div class="relative w-full h-full">
    <Silk
      :speed="5"
      :scale="1"
      :color="'#5c2f83'"
      :noise-intensity="0.1"
      :rotation="0"
      class="absolute inset-0 w-full h-full"
    ></Silk>

    <SplitText
      text="Welcome to Pzts Blog"
      class-name="relative z-10 text-2xl font-semibold text-center"
      :delay="100"
      :duration="0.6"
      ease="power3.out"
      split-type="chars"
      :from="{ opacity: 0, y: 40 }"
      :to="{ opacity: 1, y: 0 }"
      :threshold="0.1"
      root-margin="-100px"
      text-align="center"
      @animation-complete="handleAnimationComplete"
    ></SplitText>
  </div>
</template>

<script setup lang="ts">
  //背景
  import Silk from "./views/background/Silk.vue"; 

  //字体
  import SplitText from "./views/font/SplitText.vue";

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
</script>

<style scoped>

</style>