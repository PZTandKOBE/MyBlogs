<template>
  <div class="notfound">
    <h1 class="title">404</h1>
    <p class="desc">页面不存在</p>
    <RouterLink class="link" to="/portal">返回入口</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped>
.notfound {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 12px;
  text-align: center;
  background: #0b0b10;
  color: #fff;
}

.title {
  margin: 0;
  font-size: 56px;
  line-height: 1;
}

.desc {
  margin: 0;
  opacity: 0.8;
}

.link {
  color: #a78bfa;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>

