<template>
  <div class="app-root-container">
    <RouterView />
    
    <StaggeredMenu 
      v-if="showAiMenu"
      position="right"
      accent-color="#27FF64"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import StaggeredMenu from "@/components/common/StaggeredMenu.vue";

const route = useRoute();

const showAiMenu = computed(() => {
  const blackList = ['/portal', '/user', '/publish', '/edit'];
  return !blackList.some(path => route.path.startsWith(path));
});
</script>

<style>
/* 核心布局重置：消除上下左右滑动条 */
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 关键：禁止 body 滚动 */
  background-color: #000; /* 适配暗黑风格底层 */
}

#app {
  width: 100%;
  height: 100%;
}

.app-root-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 二次加固：防止组件溢出 */
}
</style>