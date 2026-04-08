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

    <div class="scroll-content" ref="scrollContainer">
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
              
              <div v-if="paginatedArticles.length === 0" class="empty-state">
                <p style="color: rgba(255,255,255,0.4);">暂时还没有发布文章哦...</p>
              </div>

              <div 
                v-else
                class="article-card" 
                v-for="article in paginatedArticles" 
                :key="article.id"
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

              <div class="pagination-container" v-if="totalPages > 1">
                <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  上一页
                </button>
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
                  下一页
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LightRays from '@/views/background/LightRays.vue';
import userInfoCard from '@/components/common/userInfoCard.vue';
import { getArticleListApi } from '@/api/article';

const router = useRouter();

// 滚动容器的引用
const scrollContainer = ref<HTMLElement | null>(null);

const goBack = () => {
  router.back();
};

const goToArticle = (id: string | number) => {
  router.push(`/article/${id}`);
};

// 存放过滤后的真实个人文章全集
const articles = ref<any[]>([]);

// === 分页核心状态 ===
const currentPage = ref(1);
const pageSize = ref(4); // 这里设置每页显示4篇文章
const totalPages = computed(() => Math.ceil(articles.value.length / pageSize.value) || 0);

// 计算当前页需要展示的文章切片
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = currentPage.value * pageSize.value;
  return articles.value.slice(start, end);
});

// 平滑滚动回顶部
const scrollToTop = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToTop();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToTop();
  }
};
// === 分页逻辑结束 ===

// 格式化时间的辅助函数 (YYYY-MM-DD)
const formatDate = (dateString: string) => {
  if (!dateString) return '刚刚';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 去除 HTML 标签，提取纯文本作为摘要
const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
};

const fetchMyArticles = async () => {
  try {
    // 拉取足量数据进行前端过滤
    const res = await getArticleListApi({ pageNum: 1, pageSize: 200 });
    
    if (res && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
      
      // 核心过滤逻辑：匹配数据库真实字段
      const myRealArticles = list.filter((item: any) => 
        item.userId === 1 || item.user_id === 1 || item.authorId === 1
      );

      // 字段映射与数据清洗
      articles.value = myRealArticles.map((item: any) => {
        let excerptText = item.summary;
        if (!excerptText && item.content) {
          const pureText = stripHtml(item.content);
          excerptText = pureText.length > 80 ? pureText.substring(0, 80) + '...' : pureText;
        }

        const tagsArray = [];
        if (item.categoryName) tagsArray.push(item.categoryName);
        else tagsArray.push('日常笔记');

        return {
          id: item.id,
          title: item.title || '无标题文章',
          date: formatDate(item.createTime || item.create_time || item.date),
          tags: tagsArray,
          excerpt: excerptText || '这个人很懒，什么都没写...'
        };
      });
    }
  } catch (error) {
    console.error('获取个人文章列表失败:', error);
  }
};

onMounted(() => {
  fetchMyArticles();
});
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
  opacity: 0.6;
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

/* 内部可滚动区域 */
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
  scroll-behavior: smooth; /* 配合JS翻页控制更丝滑 */
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
  width: 19rem;
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

.empty-state {
  padding: 2rem;
  text-align: center;
  background: rgba(15, 15, 15, 0.5);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.article-card {
  background: rgba(15, 15, 15, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
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
  pointer-events: none;
}

.read-more-btn .arrow {
  transition: transform 0.3s ease;
}

.article-card:hover .read-more-btn .arrow {
  transform: translateX(5px);
}

/* 分页器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn svg {
  width: 16px;
  height: 16px;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: "Fira Code", monospace;
  letter-spacing: 1px;
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