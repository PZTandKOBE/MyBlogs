<template>
  <div class="app-wrapper">
    <AuroraBackground class="aurora-layer" />

    <div class="fullscreen-center">
    <SplitText
      text="Welcome to Pzts Blog"
      class-name="my-title"
      :delay="100"
      :duration="0.6"
      ease="power3.out"
      split-type="chars"
      :from="{ opacity: 0, y: 40 }"
      :to="{ opacity: 1, y: 0 }"
      @animation-complete="handleAnimationComplete"
    />
  </div>
  </div>
</template>

<script setup lang="ts">
  import SplitText from "./SplitText.vue";
  //背景
  import AuroraBackground from "./views/Aurora.vue"; 

  const handleAnimationComplete = () => {
    console.log('All letters have animated over the aurora!');
  };
</script>

<style scoped>
.fullscreen-center {
  height: 100vh; /* 视口高度的 100% */
  display: flex; /* 开启 flex 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  margin: 0; 
}

.my-title {
  font-size: 6rem;
  font-weight: bold;
  text-align: center;
}
</style>