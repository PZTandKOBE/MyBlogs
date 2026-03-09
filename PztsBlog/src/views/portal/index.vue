<template>
    <div class="app-container">
      <Silk
        :speed="5"
        :scale="1"
        :color="'#262528'"
        :noise-intensity="0.1"
        :rotation="0"
      ></Silk>
  
      <transition name="fade">
        <div v-if="!isLoading" class="content-wrapper">
          <SplitText
            text="Welcome to Pzts Blog"
            class-name="blog-title"
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
  
          <button class="bubbles" @click="startTransition">
            <span class="text">进入首页</span>
          </button>
        </div>
      </transition>
  
      <transition name="fade">
        <div v-if="isLoading" class="loading-wrapper">
          <div class="🤚">
            <div class="👉"></div>
            <div class="👉"></div>
            <div class="👉"></div>
            <div class="👉"></div>
            <div class="🌴"></div>		
            <div class="👍"></div>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup lang="ts">
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import Silk from "../background/Silk.vue"; 
    import SplitText from "../font/SplitText.vue";
  
    const router = useRouter();
    const isLoading = ref(false); // 控制是否显示加载动画
  
    const handleAnimationComplete = () => {
      console.log('All letters have animated!');
    };
  
    // 点击跳转的完整流程
    const startTransition = () => {
      isLoading.value = true; // 1. 触发转场，显示加载动画
      
      // 2. 延迟 1.5 秒（让手指敲一会），然后再执行真正的路由跳转
      setTimeout(() => {
        router.push('/home'); // 请确保你的路由配置里有 /home
      }, 1500);
    };
  </script>
  
  <style scoped>
  /* ================= 布局基础 ================= */
  .app-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000;
  }
  
  .content-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    width: 100%;
  }
  
  /* ================= 字体与按钮样式 ================= */
  :deep(.blog-title) {
    color: #ffffff;
    font-size: 6rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 0px 4px 15px rgba(0, 0, 0, 0.6);
    white-space: nowrap; 
  }
  
  .bubbles {
    --c1: #212121; 
    --c2: #ffffff;
    --size-letter: 32px;
    padding: 0.5em 1.5em;
    font-size: var(--size-letter);
    background-color: transparent;
    border: calc(var(--size-letter) / 6) solid var(--c2);
    border-radius: 50px;
    cursor: pointer;
    overflow: hidden;
    position: relative;
    transition: 300ms cubic-bezier(0.83, 0, 0.17, 1);
  }
  
  .bubbles > .text {
    font-weight: 700;
    color: var(--c2);
    position: relative;
    z-index: 1;
    transition: color 700ms cubic-bezier(0.83, 0, 0.17, 1);
  }
  .bubbles::before { top: 0; left: 0; }
  .bubbles::after { top: 100%; left: 100%; }
  .bubbles::before, .bubbles::after {
    content: "";
    width: 150%;
    aspect-ratio: 1/1;
    scale: 0;
    transition: 1000ms cubic-bezier(0.76, 0, 0.24, 1);
    background-color: var(--c2);
    border-radius: 50%;
    position: absolute;
    translate: -50% -50%;
  }
  .bubbles:hover > span { color: var(--c1); }
  .bubbles:hover::before, .bubbles:hover::after { scale: 1; }
  .bubbles:active { scale: 0.98; filter: brightness(0.9); }
  
  /* ================= Vue 过渡动画 (内容淡入淡出) ================= */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  /* ================= 新增：居中包裹加载动画 ================= */
  .loading-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
  }
  
  /* ================= 你提供的敲手指动画 CSS ================= */
  .🤚 {
    --skin-color: #E4C560;
    --tap-speed: 0.6s;
    --tap-stagger: 0.1s;
    position: relative;
    width: 80px;
    height: 60px;
    /* 去掉了原代码的 margin-left: 80px，因为外层 wrapper 已经绝对居中了 */
  }
  
  .🤚:before {
    content: '';
    display: block;
    width: 180%;
    height: 75%;
    position: absolute;
    top: 70%;
    right: 20%;
    background-color: black;
    border-radius: 40px 10px;
    filter: blur(10px);
    opacity: 0.3;
  }
  
  .🌴 {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: var(--skin-color);
    border-radius: 10px 40px;
  }
  
  .👍 {
    position: absolute;
    width: 120%;
    height: 38px;
    background-color: var(--skin-color);
    bottom: -18%;
    right: 1%;
    transform-origin: calc(100% - 20px) 20px;
    transform: rotate(-20deg);
    border-radius: 30px 20px 20px 10px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    border-left: 2px solid rgba(0, 0, 0, 0.1);
  }
  
  .👍:after {
    width: 20%;
    height: 60%;
    content: '';
    background-color: rgba(255, 255, 255, 0.3);
    position: absolute;
    bottom: -8%;
    left: 5px;
    border-radius: 60% 10% 10% 30%;
    border-right: 2px solid rgba(0, 0, 0, 0.05);
  }
  
  .👉 {
    position: absolute;
    width: 80%;
    height: 35px;
    background-color: var(--skin-color);
    bottom: 32%;
    right: 64%;
    transform-origin: 100% 20px;
    animation-duration: calc(var(--tap-speed) * 2);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    transform: rotate(10deg);
  }
  
  .👉:before {
    content: '';
    position: absolute;
    width: 140%;
    height: 30px;
    background-color: var(--skin-color);
    bottom: 8%;
    right: 65%;
    transform-origin: calc(100% - 20px) 20px;
    transform: rotate(-60deg);
    border-radius: 20px;
  }
  
  .👉:nth-child(1) {
      animation-delay: 0;
      filter: brightness(70%);
      animation-name: tap-upper-1;
  }

  .👉:nth-child(2) {
      animation-delay: var(--tap-stagger);
      filter: brightness(80%);
      animation-name: tap-upper-2;
  }

  .👉:nth-child(3) {
      animation-delay: calc(var(--tap-stagger) * 2);
      filter: brightness(90%);
      animation-name: tap-upper-3;
  }

  .👉:nth-child(4) {
      animation-delay: calc(var(--tap-stagger) * 3);
      filter: brightness(100%);
      animation-name: tap-upper-4;
  }

  @keyframes tap-upper-1 {

      0%,
      50%,
      100% {
          transform: rotate(10deg) scale(0.4);
      }

      40% {
          transform: rotate(50deg) scale(0.4);
      }
  }

  @keyframes tap-upper-2 {

      0%,
      50%,
      100% {
          transform: rotate(10deg) scale(0.6);
      }

      40% {
          transform: rotate(50deg) scale(0.6);
      }
  }

  @keyframes tap-upper-3 {

      0%,
      50%,
      100% {
          transform: rotate(10deg) scale(0.8);
      }

      40% {
          transform: rotate(50deg) scale(0.8);
      }
  }

  @keyframes tap-upper-4 {

      0%,
      50%,
      100% {
          transform: rotate(10deg) scale(1);
      }

      40% {
          transform: rotate(50deg) scale(1);
      }
  }

  </style>