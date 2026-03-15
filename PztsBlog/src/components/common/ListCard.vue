<template>
  <div class="list-card-wrapper glass-container">
    <div v-if="articles.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="empty-text">暂无文章</p>
      <div class="empty-line"></div>
    </div>

    <div v-else class="article-list">
      <div 
        v-for="item in articles" 
        :key="item.id" 
        class="article-item"
        @click="goToArticle(item.id)"
      >
        <h3 class="article-title">{{ item.title }}</h3>
        <p class="article-summary">{{ item.summary }}</p>
        <div class="article-meta">
          <span class="author">By {{ item.author }}</span>
          <span class="date">{{ item.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 内部定义模拟数据，后续可以在这里发起外部接口请求进行赋值
const articles = ref([
  {
    id: 1,
    title: 'Vue3 组合式 API 的最佳实践与思考',
    summary: '本文总结了在现代前端项目开发中，如何优雅地组织和复用组合式 API (Composition API) 的代码逻辑，以及状态管理的一些避坑指南。',
    date: '2026-03-10',
    author: '彭梓涛'
  },
  {
    id: 2,
    title: 'Vite 深度优化指南：让冷启动快如闪电',
    summary: '记录了在个人博客系统开发过程中，遇到的打包体积过大、冷启动慢等问题，以及如何通过 Vite 配置进行依赖预构建和分包优化。',
    date: '2026-03-08',
    author: '彭梓涛'
  },
  {
    id: 3,
    title: 'CSS 玻璃质感(Glassmorphism)设计解析',
    summary: '探讨如何利用 backdrop-filter 和 rgba 颜色模型，打造具有空间层次感且高级感拉满的现代 Web UI 视觉效果。',
    date: '2026-03-05',
    author: '彭梓涛'
  }
]);

const goToArticle = (id: number) => {
  router.push({ name: 'article', params: { id } });
};
</script>

<style scoped>
/* ================= 外部大框：仅保留玻璃底色，无 Hover 动效 ================= */
.list-card-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 内容超出时允许滚动 */
  padding: 1.5rem;
  box-sizing: border-box; /* 关键：防止 padding 撑破容器 */
}

/* 隐藏滚动条，保持页面整洁 */
.list-card-wrapper::-webkit-scrollbar {
  display: none;
}

.glass-container {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

/* ================= 内部文章列表及卡片动效 ================= */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.article-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 核心：将悬浮特效精准赋予每一张内部卡片 */
.article-item:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5);
}

.article-title {
  font-family: sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.6rem 0;
  letter-spacing: 0.5px;
}

.article-summary {
  font-family: sans-serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0 0 1.2rem 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* 限制摘要最多显示两行 */
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: sans-serif;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}

.author {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
}

/* ================= 空状态样式 ================= */
.empty-state {
  flex: 1; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  color: rgba(255, 255, 255, 0.4);
}

.empty-icon {
  width: 48px;
  height: 48px;
  opacity: 0.5;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.empty-state:hover .empty-icon {
  opacity: 0.9;
  transform: scale(1.05);
}

.empty-text {
  font-family: sans-serif;
  font-size: 1.1rem;
  letter-spacing: 0.25em; 
  margin: 0;
  font-weight: 300;
  text-indent: 0.25em; 
}

.empty-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: width 0.4s ease, background 0.4s ease;
}

.empty-state:hover .empty-line {
  width: 100px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
}
</style>