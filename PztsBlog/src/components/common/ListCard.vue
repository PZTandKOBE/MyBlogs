<template>
  <div class="list-card-wrapper glass-container" ref="listWrapperRef">
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

    <div v-else class="article-content-container">
      <div class="article-list">
        <div 
          v-for="item in articles" 
          :key="item.id" 
          class="article-item"
          @click="goToArticle(item.id)"
        >
          <h3 class="article-title">
            <span v-if="item.categoryName" class="category-badge">{{ item.categoryName }}</span>
            {{ item.title }}
          </h3>
          <p class="article-summary">{{ item.summary }}</p>
          <div class="article-meta">
            <span class="author">By {{ item.author }}</span>
            <span class="date">{{ item.date }}</span>
          </div>
        </div>
      </div>

      <div class="pagination-container">
        <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          上一页
        </button>
        
        <span class="page-info">
          {{ totalPages > 0 ? `${currentPage} / ${totalPages}` : `第 ${currentPage} 页` }}
        </span>

        <button class="page-btn" :disabled="!hasNextPage" @click="nextPage">
          下一页
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getArticleListApi } from '@/api/article';

const router = useRouter();

const props = defineProps({
  categoryId: {
    type: [Number, String, null],
    default: null
  },
  // 接收从首页导航栏传来的查询关键词
  keyword: {
    type: String,
    default: ''
  }
});

const listWrapperRef = ref<HTMLElement | null>(null);
const articles = ref<any[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const totalArticles = ref(0); 

const totalPages = computed(() => {
  return totalArticles.value > 0 ? Math.ceil(totalArticles.value / pageSize.value) : 0;
});

const hasNextPage = computed(() => {
  if (totalPages.value > 0) {
    return currentPage.value < totalPages.value;
  }
  return articles.value.length === pageSize.value;
});

const categoryMap: Record<number, string> = {
  1: '生活',
  2: '游戏',
  3: '技术'
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '刚刚发布';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr; 
  
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const D = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  
  return `${Y}-${M}-${D} ${h}:${m}`;
};

const scrollToTop = () => {
  if (listWrapperRef.value) {
    listWrapperRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const fetchArticles = async () => {
  try {
    const params: any = { 
      pageNum: currentPage.value, 
      pageSize: pageSize.value 
    };
    
    if (props.categoryId) {
      params.categoryId = Number(props.categoryId);
    }

    // 将 keyword 加入到 API 请求中
    if (props.keyword) {
      params.keyword = props.keyword;
    }
    
    const res = await getArticleListApi(params);
    
    if (res && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
      totalArticles.value = res.data.total || 0; 
      
      articles.value = list.map((item: any) => {
        let generateSummary = item.summary;
        if (!generateSummary && item.content) {
          generateSummary = item.content.length > 80 
            ? item.content.substring(0, 80) + '...' 
            : item.content;
        }

        return {
          id: item.id,
          title: item.title || '无标题',
          summary: generateSummary || '暂无摘要',
          date: formatTime(item.createTime || item.date),
          author: item.authorName || item.author || '彭梓涛',
          categoryName: categoryMap[item.categoryId] || ''
        };
      });
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchArticles().then(scrollToTop);
  }
};

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
    fetchArticles().then(scrollToTop);
  }
};

// 监听分类ID或关键词的变化：只要改了就重置到第一页，并重新请求
watch(() => [props.categoryId, props.keyword], () => {
  currentPage.value = 1;
  fetchArticles().then(scrollToTop);
});

onMounted(() => {
  fetchArticles();
});

const goToArticle = (id: number) => {
  router.push({ name: 'article', params: { id } });
};
</script>

<style scoped>
.list-card-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1.5rem;
  box-sizing: border-box;
  scroll-behavior: smooth;
}

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

.article-content-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  flex: 1;
}

.article-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-item:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5);
}

.article-title {
  display: flex;
  align-items: center;
  font-family: sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.6rem 0;
  letter-spacing: 0.5px;
}

.category-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  margin-right: 0.6rem;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.article-summary {
  font-family: sans-serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0 0 1.2rem 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
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

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
  margin-bottom: 2rem;
  padding-top: 1.5rem;
  padding-bottom: 1rem;
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