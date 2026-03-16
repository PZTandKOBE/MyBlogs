<template>
  <div class="user-page-container">
    <div class="background-layer">
      <LightRays class="light-rays-bg" />
    </div>

    <div class="nav-bar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>返回</span>
      </button>
    </div>

    <div class="scroll-content">
      <div class="main-layout">
        
        <div class="left-sidebar">
          <div class="sticky-card">
            <userInfoCard />
          </div>
        </div>

        <div class="right-content">
          
          <section class="info-section fade-in">
            <h2 class="section-title">关于我 <span>/ ABOUT ME</span></h2>
            <div class="glass-panel intro-panel">
              <p class="intro-text">
                一位GCU的大二学生，正在学习全栈技术以及服务器，这是我的个人博客系统，感谢你能点进来！
              </p>
              <p class="intro-text">
                在代码之外，我喜欢在 CS 的竞技世界里保持专注，也是梅西跟科比的忠实球迷。
              </p>
            </div>
          </section>

          <section class="info-section fade-in delay-1">
            <h2 class="section-title">发布过的文章 <span>/ PUBLISHED ARTICLES</span></h2>
            <div class="articles-list">
              
              <div 
                class="article-card" 
                v-for="(article, index) in articles" 
                :key="index"
                @click="goToArticle(article.id)"
              >
                <div class="article-meta">
                  <span class="article-date">{{ article.date }}</span>
                  <div class="article-tags">
                    <span class="tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
                  </div>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-excerpt">{{ article.excerpt }}</p>
                <button class="read-more-btn">Read More <span class="arrow">→</span></button>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import LightRays from '@/views/background/LightRays.vue';
import userInfoCard from '@/components/common/userInfoCard.vue';

const router = useRouter();

const goBack = () => {
  router.back();
};

// 跳转到文章详情页
const goToArticle = (id: string) => {
  router.push(`/article/${id}`);
};

// 模拟“发布过的文章”数据，加入 id 字段用于路由跳转
const articles = [
  {
    id: '1',
    title: 'Vue3 与 Three.js 融合：打造沉浸式 3D 博客主页',
    date: '2026-03-12',
    tags: ['Vue3', 'Three.js', '前端动画'],
    excerpt: '探讨如何在 Vite + Vue3 项目中优雅地引入 WebGL 动画，利用 GSAP 与 OGL 实现丝滑的页面过渡与光影效果，让个人博客不再单调。'
  },
  {
    id: '2',
    title: '智能伴游系统的前端架构设计与组件化实践',
    date: '2026-01-26',
    tags: ['架构设计', '项目复盘', 'Vue3'],
    excerpt: '复盘近期主导的智能伴游系统项目，分享在处理语音输入、图像识别交互以及知识问答游戏模块时，如何进行合理的状态管理与组件拆分。'
  },
  {
    id: '3',
    title: '致敬传奇：从里奥·梅西的职业生涯看纯粹的坚持',
    date: '2025-12-18',
    tags: ['随笔', '生活', '足球'],
    excerpt: '在这个快节奏的时代，重温梅西在绿茵场上的那些经典瞬间。技术、视野与日复一日的自律，其实和我们敲击键盘写代码的追求有着异曲同工之妙。'
  },
  {
    id: '4',
    title: 'CS 竞技心得：精准定位与急停的肌肉记忆训练',
    date: '2025-11-05',
    tags: ['游戏', 'CS', '随笔'],
    excerpt: '分享最近观看 Danking 比赛录像后的一些心得。关于预瞄点、急停手感以及在逆风局中如何保持心态平和的几点思考。'
  }
];
</script>

<style scoped>
/* 根容器，确保全屏且隐藏外部滚动条 */
.user-page-container {
  width: 100%;
  height: 100vh;
  background-color: #000000;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 背景层，置于最底层 */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.6; /* 调低亮度，契合黑暗简约风 */
}

/* 简单的顶部返回导航 */
.nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 4rem;
  z-index: 20;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.back-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(-5px);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

/* 内部可滚动区域 —— 添加了 box-sizing 彻底修复截断问题 */
.scroll-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  z-index: 10;
  padding-top: 100px;
  padding-bottom: 100px;
  box-sizing: border-box; 
}

.scroll-content::-webkit-scrollbar {
  width: 6px;
}
.scroll-content::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

/* 主体左右布局 */
.main-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 4rem;
  padding: 0 2rem;
  align-items: flex-start;
}

/* 左侧固定侧边栏 */
.left-sidebar {
  width: 19rem; /* 与 userInfoCard 宽度保持一致 */
  flex-shrink: 0;
}

.sticky-card {
  position: sticky;
  top: 100px;
}

/* 右侧内容区 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

/* 区块通用标题 */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.section-title span {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 400;
  letter-spacing: 1px;
}

/* 毛玻璃面板通用样式 */
.glass-panel {
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  transition: border-color 0.3s ease, transform 0.3s ease;
}

.glass-panel:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

/* 个人介绍特定样式 */
.intro-text {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}
.intro-text:last-child {
  margin-bottom: 0;
}

/* 文章列表样式 */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-card {
  background: rgba(15, 15, 15, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer; /* 提示这是一个可点击的卡片 */
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: #fff;
  transform: scaleY(0);
  transition: transform 0.4s ease;
  transform-origin: bottom;
}

.article-card:hover {
  background: rgba(25, 25, 25, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.article-card:hover::before {
  transform: scaleY(1);
  transform-origin: top;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.article-date {
  font-family: "Fira Code", monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}

.article-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
}

.article-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 0.8rem;
  transition: color 0.3s ease;
}

.article-card:hover .article-title {
  color: #f0f0f0;
}

.article-excerpt {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 1.5rem;
}

.read-more-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  pointer-events: none; /* 让外层卡片接管点击事件，防止内层按钮拦截 */
}

.read-more-btn .arrow {
  transition: transform 0.3s ease;
}

.article-card:hover .read-more-btn .arrow {
  transform: translateX(5px);
}

/* 简单的入场动画 */
.fade-in {
  animation: fadeInUP 0.8s ease backwards;
}
.delay-1 {
  animation-delay: 0.2s;
}

@keyframes fadeInUP {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  
  .left-sidebar {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .sticky-card {
    position: relative;
    top: 0;
  }

  .nav-bar {
    padding: 0 2rem;
  }
}
</style>