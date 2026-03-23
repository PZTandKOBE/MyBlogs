<template>
  <div class="article-page">
    
    <div class="fixed-menu-container" :class="{ 'is-open': isMenuOpen }">
      <StaggeredMenu
        position="right"
        :items="menuItems"
        :social-items="socialItems"
        :display-socials="true"
        :display-item-numbering="true"
        menu-button-color="#ffffff"
        open-menu-button-color="#000000"
        :change-menu-color-on-open="true"
        :colors="['#9EF2B2', '#27FF64']"   
        :logo-url="logo"
        accent-color="#27FF64"             
        @menu-open="handleMenuOpen"
        @menu-close="handleMenuClose"
      />
    </div>

    <div class="progress-bar" :style="{ width: progress + '%' }"></div>

    <LightRays
      rays-origin="top-center"
      rays-color="#ffffff"
      :rays-speed="1.5"
      :light-spread="0.8"
      :ray-length="1.2"
      :follow-mouse="true"
      :mouse-influence="0.1"
      :noise-amount="0.1"
      :distortion="0.05"
      class-name="custom-rays"
    />

    <div class="scroll-wrapper" ref="scrollWrapper" @scroll="handleScroll">
      <div class="article-layout">
        
        <div class="main-content-wrapper">
          <div class="article-container glass-container">
            <h1 class="title">{{ articleData.title }}</h1>
            <div class="meta">
              <span class="author">By {{ articleData.author }}</span>
              <span class="date">{{ articleData.date }}</span>
            </div>
            <div class="divider"></div>

            <div class="markdown-body" ref="articleBody" v-html="articleData.content"></div>
          </div>

          <div class="comment-section-wrapper">
            <CommentSection :article-id="route.params.id" />
          </div>
        </div>

        <div class="right-sidebar">
          
          <div class="author-card glass-container">
            <div class="author-header">
              <img :src="articleData.authorAvatar" alt="author avatar" class="author-avatar" />
              <div class="author-info">
                <div class="author-name">{{ articleData.author }}</div>
                <div class="author-title">{{ articleData.authorTitle }}</div>
              </div>
            </div>
            <div class="author-stats">
              <div class="stat-item">
                <span class="stat-num">{{ articleData.authorArticles }}</span>
                <span class="stat-label">文章</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ articleData.authorTags }}</span>
                <span class="stat-label">标签</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ articleData.authorLikes }}</span>
                <span class="stat-label">获赞</span>
              </div>
            </div>
          </div>

          <aside class="toc-sidebar glass-container">
            <h3 class="toc-title">目录</h3>
            <ul class="toc-list">
              <li
                v-for="item in toc"
                :key="item.id"
                :class="['toc-item', `level-${item.level}`, { active: activeId === item.id }]"
                @click="scrollTo(item.id)"
              >
                <div class="toc-indicator"></div>
                {{ item.text }}
              </li>
            </ul>
          </aside>

        </div>

      </div>

      <button
        class="back-to-top"
        :class="{ show: showBackToTop }"
        @click="scrollToTop"
        aria-label="返回顶部"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20V4M12 4L5 11M12 4L19 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import MarkdownIt from "markdown-it"; 
import LightRays from "../background/LightRays.vue";
import StaggeredMenu from "@/components/common/StaggeredMenu.vue";
import logo from "@/assets/Blog.svg";
import CommentSection from "@/components/comment/index.vue";

// 引入文章详情 API 和 获取用户详情 API
import { getArticleDetailApi } from "@/api/article";
import { getUserByIdApi } from "@/api/user";

const route = useRoute();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true
});

const isMenuOpen = ref(false);
const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/home' },
  { label: 'Store', ariaLabel: 'View our store', link: '/store' },
  { label: 'Portal', ariaLabel: 'Go to portal', link: '/portal' }
];
const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];

const handleMenuOpen = () => { isMenuOpen.value = true; };
const handleMenuClose = () => { isMenuOpen.value = false; };

const scrollWrapper = ref<HTMLElement | null>(null);
const articleBody = ref<HTMLElement | null>(null);

const progress = ref(0);
const showBackToTop = ref(false);
const activeId = ref("");

interface TocItem {
  id: string;
  text: string;
  level: number;
}
const toc = ref<TocItem[]>([]);

// 增加作者相关的响应式字段兜底
const articleData = ref({
  title: '加载中...',
  author: '...',
  authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peng&backgroundColor=1a1a1a',
  authorTitle: '...',
  authorArticles: 0,
  authorTags: 0,
  authorLikes: '0',
  date: '...',
  content: '<p>正在加载文章内容...</p>'
});

const fetchArticleDetail = async () => {
  const articleId = route.params.id;
  if (!articleId) return;

  try {
    // 1. 第一步：拉取文章详情
    const res = await getArticleDetailApi(articleId as string);
    if (res && res.data) {
      const rawContent = res.data.content || '暂无内容';
      
      // 先将文章本身的数据映射上去，同时给作者信息一个初步的默认值
      articleData.value = {
        title: res.data.title || '无标题',
        author: res.data.authorName || res.data.author || '匿名作者',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest&backgroundColor=1a1a1a',
        authorTitle: '专栏作者',
        authorArticles: 0, 
        authorTags: 0,
        authorLikes: '0',
        date: res.data.createTime || res.data.date || '刚刚发布',
        content: md.render(rawContent) 
      };

      // 提取作者 ID（兼容后端可能命名为 authorId 或是 userId）
      const authorId = res.data.authorId || res.data.userId;

      // 2. 第二步：如果存在作者 ID，发起拉取作者详情的请求
      if (authorId) {
        try {
          const userRes = await getUserByIdApi(authorId);
          if (userRes && userRes.data) {
            // 使用拉取到的真实作者数据覆盖默认值
            articleData.value.author = userRes.data.username || articleData.value.author;
            articleData.value.authorAvatar = userRes.data.avatar || userRes.data.avatarUrl || articleData.value.authorAvatar;
            articleData.value.authorTitle = userRes.data.title || userRes.data.role || articleData.value.authorTitle;
            // 统计数据如果有就覆盖，没有就保留默认
            articleData.value.authorArticles = userRes.data.articleCount || userRes.data.repoCount || 42;
            articleData.value.authorTags = userRes.data.tagsCount || 128;
            articleData.value.authorLikes = userRes.data.likesCount || userRes.data.followerCount || '12.5k';
          }
        } catch (userError) {
          console.warn('获取文章作者详细信息失败，将使用兜底信息展示', userError);
        }
      }

      // 等待 DOM 渲染完毕，初始化目录和代码块复制
      await nextTick();
      initArticleEnhancements();
    }
  } catch (error) {
    console.error('获取文章详情失败:', error);
    articleData.value.title = '获取失败';
    articleData.value.content = '<p>文章加载失败，请检查网络或刷新重试。</p>';
  }
};

const initArticleEnhancements = async () => {
  await nextTick();
  if (!articleBody.value) return;

  const headers = articleBody.value.querySelectorAll("h2, h3");
  const tocArr: TocItem[] = [];
  
  headers.forEach((el, index) => {
    const id = `heading-${index}`;
    el.id = id; 
    tocArr.push({
      id,
      text: (el as HTMLElement).innerText,
      level: el.tagName === "H2" ? 2 : 3
    });
  });
  toc.value = tocArr;

  const pres = articleBody.value.querySelectorAll("pre");
  pres.forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "copy-code-btn";
    btn.innerText = "Copy";
    
    btn.onclick = async () => {
      try {
        const code = pre.querySelector("code")?.innerText || pre.innerText;
        await navigator.clipboard.writeText(code);
        btn.innerText = "Copied!";
        btn.classList.add("success");
        setTimeout(() => {
          btn.innerText = "Copy";
          btn.classList.remove("success");
        }, 2000);
      } catch (err) {
        btn.innerText = "Failed";
      }
    };
    pre.appendChild(btn);
  });
};

const handleScroll = () => {
  if (!scrollWrapper.value) return;
  const { scrollTop, scrollHeight, clientHeight } = scrollWrapper.value;
  
  progress.value = (scrollTop / (scrollHeight - clientHeight)) * 100 || 0;
  showBackToTop.value = scrollTop > 300;

  if (toc.value.length === 0) return;
  
  let currentId = toc.value[0].id;
  for (const item of toc.value) {
    const el = document.getElementById(item.id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 150) {
        currentId = item.id;
      }
    }
  }
  activeId.value = currentId;
};

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el && scrollWrapper.value) {
    const wrapperRect = scrollWrapper.value.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = scrollWrapper.value.scrollTop + (elRect.top - wrapperRect.top) - 80;
    
    scrollWrapper.value.scrollTo({ top, behavior: "smooth" });
  }
};

const scrollToTop = () => {
  scrollWrapper.value?.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  fetchArticleDetail();
});
</script>

<style scoped>
/* ================= 页面底层容器 ================= */
.article-page {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #000000;
  overflow: hidden;
}

.article-page :deep(.light-rays-container) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* ================= 悬浮菜单容器 ================= */
.fixed-menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
}

.fixed-menu-container.is-open {
  pointer-events: auto;
}

.fixed-menu-container :deep(.staggered-menu-header),
.fixed-menu-container :deep(.staggered-menu-header *) {
  pointer-events: auto !important;
}

/* ================= 极细进度条 ================= */
.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  background: #ffffff;
  z-index: 100;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.5);
}

/* ================= 独立滚动层 ================= */
.scroll-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  overflow-y: auto;
  padding: 6rem 2rem 4rem 2rem;
  box-sizing: border-box;
}

.scroll-wrapper::-webkit-scrollbar {
  display: none;
}

/* ================= 网格布局排版 ================= */
.article-layout {
  display: grid;
  grid-template-columns: 1fr minmax(auto, 850px) 1fr;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

/* 中间主内容包裹层（文章+评论） */
.main-content-wrapper {
  grid-column: 2;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ================= 右侧统一悬浮容器 ================= */
.right-sidebar {
  grid-column: 3;
  width: 280px;
  position: sticky;
  top: 6rem;
  align-self: start;
  justify-self: start;
  margin-left: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ================= 宽版玻璃拟态容器 ================= */
.glass-container {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.article-container {
  padding: 3rem 4rem;
}

/* ================= 评论区外部容器 ================= */
.comment-section-wrapper {
  width: 100%;
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ================= 作者信息卡片样式 ================= */
.author-card {
  padding: 1.8rem;
}

.author-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: #1a1a1a;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.author-name {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.author-title {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.author-stats {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.stat-num {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-label {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
}

/* ================= 目录卡片样式 ================= */
.toc-sidebar {
  padding: 1.8rem;
}

.toc-title {
  color: #ffffff;
  font-family: sans-serif;
  font-size: 1.1rem;
  margin: 0 0 1.2rem 0;
  letter-spacing: 2px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.toc-item {
  position: relative;
  font-family: sans-serif;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toc-item:hover {
  color: rgba(255, 255, 255, 0.9);
}

.toc-item.active {
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.toc-item.level-3 {
  padding-left: 1.5rem;
  font-size: 0.85rem;
}

.toc-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #ffffff;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.toc-item.active .toc-indicator {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 8px #ffffff;
}

/* ================= 文章信息与 Markdown ================= */
.title {
  color: #ffffff;
  font-family: sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  letter-spacing: 1px;
  line-height: 1.3;
}

.meta {
  display: flex;
  gap: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: sans-serif;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.author {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), transparent);
  margin-bottom: 3rem;
}

.markdown-body {
  font-family: sans-serif;
  color: rgba(255, 255, 255, 0.85);
}

.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  color: #ffffff;
  margin: 2.5rem 0 1.2rem 0;
  font-weight: 600;
  scroll-margin-top: 80px;
}

.markdown-body :deep(h2) {
  font-size: 1.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.markdown-body :deep(h3) {
  font-size: 1.4rem;
  color: #e0e0e0;
}

.markdown-body :deep(p) {
  line-height: 1.8;
  margin: 0 0 1.5rem 0;
  font-size: 1.05rem;
}

.markdown-body :deep(ul) {
  margin: 0 0 1.5rem 1.5rem;
  padding: 0;
}

.markdown-body :deep(li) {
  line-height: 1.8;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #ffffff;
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
}

.markdown-body :deep(pre) {
  position: relative;
  background: #0f111a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 3.5rem 1.5rem 1.5rem 1.5rem;
  overflow-x: auto;
  margin: 2rem 0;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

.markdown-body :deep(pre)::before {
  content: '';
  position: absolute;
  top: 1rem;
  left: 1.2rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f56;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}

.markdown-body :deep(code) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  color: #e2e8f0;
}

.markdown-body :deep(.copy-code-btn) {
  position: absolute;
  top: 0.7rem;
  right: 1rem;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: sans-serif;
}

.markdown-body :deep(.copy-code-btn):hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.markdown-body :deep(.copy-code-btn.success) {
  background: rgba(255, 255, 255, 0.2);
  border-color: #ffffff;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

/* ================= 返回顶部按钮 ================= */
.back-to-top {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
}

.back-to-top.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.back-to-top:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffffff;
  color: #ffffff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.back-to-top svg {
  width: 24px;
  height: 24px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .article-layout {
    display: flex;
    justify-content: center;
  }

  .right-sidebar {
    display: none;
  }

  .main-content-wrapper {
    max-width: 800px;
    padding: 0 1.5rem;
  }

  .article-container {
    padding: 2rem 1.5rem;
  }
}
</style>