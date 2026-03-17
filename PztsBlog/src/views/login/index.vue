<template>
    <div class="auth-page-container">
      
      <div class="background-wrapper">
        <PixelSnow
          color="#ffffff"
          :flakeSize="0.01"
          :minFlakeSize="1.25"
          :pixelResolution="1000"
          :speed="1.25"
          :density="0.3"
          :direction="125"
          :brightness="1"
        />
      </div>
  
      <div class="card-layer fade-in">
        <loginCard />
      </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import PixelSnow from '@/views/background/PixelSnow.vue';
  import loginCard from '@/components/common/loginCard.vue';
  </script>
  
  <style scoped>
  /* 根容器：纯黑底色，定位基准 */
  .auth-page-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: #000000; /* 必须是深色底，白色雪花才能显现 */
    overflow: hidden;
  }
  
  /* 背景层：使用绝对定位铺满视口，层级垫底 */
  .background-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
  }
  
  /* 杀手锏：强制 PixelSnow 内部的容器和画布撑满，杜绝 0x0 渲染黑屏 */
  .background-wrapper :deep(div),
  .background-wrapper :deep(canvas) {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
  
  /* 卡片层：独立覆盖在上方，负责 Flex 居中 */
  .card-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  /* 卡片入场浮现动画 */
  .fade-in {
    animation: fadeInUP 0.8s cubic-bezier(0.4, 0, 0.2, 1) backwards;
  }
  
  @keyframes fadeInUP {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>