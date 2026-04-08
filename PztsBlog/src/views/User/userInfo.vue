<template>
  <div class="user-info-container">
    <div class="background-layer">
      <LightRays class="light-rays-bg" />
    </div>

    <div class="nav-bar">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>返回首页</span>
      </button>
    </div>

    <div class="dashboard-layout fade-in">
      <h1 class="page-title">User Settings <span>/ 个人资料设置</span></h1>

      <div class="dashboard-content">
        <div class="profile-side glass-panel">
          <div class="avatar-wrapper">
            <div class="avatar">
              <span class="avatar-text">{{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'P' }}</span>
            </div>
          </div>

          <div class="user-details">
            <h2 class="user-name">{{ userInfo.username }}</h2>
            <p class="user-email">{{ userInfo.email }}</p>
            <p class="user-bio">{{ userInfo.bio || '这个人很懒，什么都没留下...' }}</p>
          </div>

          <div class="stats-box">
            <div class="stat-item">
              <span class="num">{{ publishedArticles.length }}</span>
              <span class="label">我的文章</span>
            </div>
            <div class="stat-item">
              <span class="num">12</span>
              <span class="label">我的评论</span>
            </div>
          </div>

          <div class="side-actions">
            <button class="edit-btn" @click="showEditModal = true">修改资料</button>
            <button class="logout-btn" @click="handleLogout">退出登录</button>
          </div>
        </div>

        <div class="right-side">
          <div class="articles-side glass-panel">
            <h2 class="section-title">我的文章 <span>/ Published Articles</span></h2>

            <div v-if="paginatedArticles.length === 0" class="empty-state">
              暂无发表的文章，去工作台写一篇吧！
            </div>

            <div v-else class="article-list">
              <div class="article-item" v-for="article in paginatedArticles" :key="article.id"
                @click="goToArticle(article.id)">
                <div class="article-header">
                  <h3 class="article-title">{{ article.title }}</h3>
                  <span class="status-pill" :class="article.status">{{ article.statusText }}</span>
                </div>
                <div class="article-meta">
                  <div class="meta-left">
                    <span class="meta-item">发布于：{{ article.date }}</span>
                    <span class="meta-item">阅读量：{{ article.views }}</span>
                  </div>
                  <button class="delete-article-btn" @click.stop="confirmDeleteArticle(article.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    删除
                  </button>
                </div>
              </div>
            </div>

            <div class="pagination-container" v-if="totalPages > 1">
              <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                上一页
              </button>
              <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
              <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
                下一页
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showEditModal" @click="showEditModal = false">
      <div class="modal-content glass-panel" @click.stop>
        <h2 class="modal-title">修改基本信息</h2>
        <form @submit.prevent="saveProfile" class="settings-form">
          <div class="input-group">
            <label>昵称 / Username</label>
            <input type="text" v-model="userInfo.username" placeholder="请输入昵称" required />
          </div>
          <div class="input-group">
            <label>邮箱 / Email</label>
            <input type="email" v-model="userInfo.email" placeholder="请输入邮箱" required />
          </div>
          <div class="input-group">
            <label>个人签名 / Bio</label>
            <textarea v-model="userInfo.bio" rows="3" placeholder="写点什么介绍一下自己吧..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showEditModal = false">取消</button>
            <button type="submit" class="save-btn">保存修改</button>
          </div>
        </form>
      </div>
    </div>

    <AlertModal v-model:visible="alertVisible" :type="alertType" :title="alertTitle" :message="alertMessage"
      @confirm="handleAlertConfirm" @cancel="handleAlertCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import LightRays from '@/views/background/LightRays.vue';
import AlertModal from '@/views/Error/index.vue';
import { getCurrentUserApi } from '@/api/user';
import { getArticleListApi, deleteArticleApi } from '@/api/article';

const router = useRouter();

const alertVisible = ref(false);
const alertType = ref<'success' | 'error' | 'confirm'>('success');
const alertTitle = ref('提示');
const alertMessage = ref('');

const pendingAction = ref<'logout' | 'deleteArticle' | null>(null);
const deleteTargetId = ref<number | null>(null);

const showAlert = ({ type = 'success', title = '提示', message }: any) => {
  alertType.value = type;
  alertTitle.value = title;
  alertMessage.value = message;
  alertVisible.value = true;
};

const handleAlertConfirm = async () => {
  if (pendingAction.value === 'logout') {
    localStorage.removeItem('token');
    router.push('/Home');
  } else if (pendingAction.value === 'deleteArticle' && deleteTargetId.value !== null) {
    try {
      const res = await deleteArticleApi(deleteTargetId.value);
      if (res && res.code === 200) {
        publishedArticles.value = publishedArticles.value.filter(a => a.id !== deleteTargetId.value);
        setTimeout(() => showAlert({ type: 'success', title: '删除成功', message: '文章已彻底删除！' }), 300);
      } else {
        setTimeout(() => showAlert({ type: 'error', title: '删除失败', message: res.message || '操作失败' }), 300);
      }
    } catch (error) {
      setTimeout(() => showAlert({ type: 'error', title: '网络错误', message: '请求失败' }), 300);
    }
  }
  pendingAction.value = null;
  deleteTargetId.value = null;
};

const handleAlertCancel = () => {
  pendingAction.value = null;
  deleteTargetId.value = null;
};

const showEditModal = ref(false);

const userInfo = ref({
  id: null,
  username: '',
  email: '',
  bio: ''
});

const publishedArticles = ref<any[]>([]);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);
const totalPages = computed(() => Math.ceil(publishedArticles.value.length / pageSize.value) || 0);
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return publishedArticles.value.slice(start, start + pageSize.value);
});

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };

// --- 新增：专门处理中文年月日的格式化函数 ---
const formatDate = (dateString: string) => {
  if (!dateString) return '刚刚';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 月份不要补0，更符合中文阅读习惯
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
};

const fetchUserData = async () => {
  try {
    const res = await getCurrentUserApi();
    if (res && res.data) {
      userInfo.value.id = res.data.id;
      userInfo.value.username = res.data.username || '彭梓涛';
      userInfo.value.email = res.data.email || 'pengzitao@example.com';
      userInfo.value.bio = res.data.bio || '保持热爱，奔赴山海。';
      fetchUserArticles();
    }
  } catch (error) {
    console.error("获取个人资料失败", error);
  }
};

const fetchUserArticles = async () => {
  try {
    const res = await getArticleListApi({ pageNum: 1, pageSize: 1000 });
    if (res && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
      const myList = list.filter((item: any) => {
        return Number(item.userId) === Number(userInfo.value.id) || Number(item.user_id) === Number(userInfo.value.id);
      });
      publishedArticles.value = myList.map((item: any) => ({
        id: item.id,
        title: item.title,
        // --- 修改：在这里调用 formatDate ---
        date: formatDate(item.createTime || item.create_time),
        views: item.viewCount || item.view_count || 0,
        status: item.status === 1 ? 'published' : 'draft',
        statusText: item.status === 1 ? '已发布' : '草稿'
      }));
    }
  } catch (error) {
    console.error("获取文章列表失败", error);
  }
};

onMounted(() => {
  fetchUserData();
});

const goBack = () => router.push('/Home');
const goToArticle = (id: number) => router.push({ name: 'article', params: { id } });

const saveProfile = () => {
  showEditModal.value = false;
  showAlert({ type: 'success', message: '资料保存成功！' });
};

const handleLogout = () => {
  pendingAction.value = 'logout';
  showAlert({ type: 'confirm', title: '退出登录', message: '确定要退出当前账号吗？' });
};

const confirmDeleteArticle = (id: number) => {
  pendingAction.value = 'deleteArticle';
  deleteTargetId.value = id;
  showAlert({ type: 'confirm', title: '删除文章', message: '确定要彻底删除这篇文章吗？此操作不可恢复！' });
};
</script>

<style scoped>
/* ================= 全局与基础排版 ================= */
.user-info-container {
  width: 100%;
  height: 100vh;
  background-color: #000000;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  color: #ffffff;
  font-family: "Inter", "PingFang SC", sans-serif;
  box-sizing: border-box;
}

.user-info-container * {
  box-sizing: border-box;
}

.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.6;
  pointer-events: none;
}

/* ================= 导航栏 ================= */
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
  display: inline-flex;
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
  white-space: nowrap;
}

.back-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(-5px);
}

.back-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* ================= 布局面板 ================= */
.dashboard-layout {
  position: relative;
  z-index: 10;
  max-width: 1100px;
  margin: 100px auto 50px auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.page-title span {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 400;
}

.dashboard-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.glass-panel {
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
}

/* ================= 左侧用户信息栏 ================= */
.profile-side {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: sticky;
  top: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #333, #111);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}

.user-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.badge.role {
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.user-details {
  text-align: center;
  width: 100%;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.user-email {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  font-family: "Fira Code", monospace;
  margin-bottom: 1rem;
}

.user-bio {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  padding: 0 1rem;
}

.stats-box {
  width: 100%;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.stat-item .num {
  font-size: 1.4rem;
  font-weight: 600;
  font-family: "Fira Code", monospace;
}

.stat-item .label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.side-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.edit-btn {
  width: 100%;
  background: #ffffff;
  color: #000000;
  border: none;
  font-weight: 600;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.logout-btn {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.8);
}

/* ================= 右侧文章列表 ================= */
.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 1rem;
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.article-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  transition: color 0.3s;
}

.article-item:hover .article-title {
  color: #00f2ea;
}

.status-pill {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.status-pill.published {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-pill.draft {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-left {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: "Fira Code", monospace;
}

.delete-article-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
}

.delete-article-btn svg {
  width: 14px;
  height: 14px;
}

.article-item:hover .delete-article-btn {
  opacity: 1;
}

.delete-article-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.6);
}

/* ================= 分页器 ================= */
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.5rem 1rem;
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

/* ================= 修改信息 Modal ================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  width: 90%;
  max-width: 480px;
  padding: 2.5rem;
  position: relative;
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-title {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.input-group input,
.input-group textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  font-family: inherit;
  resize: none;
}

.input-group input:focus,
.input-group textarea:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.4);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ccc;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.save-btn {
  background: #fff;
  color: #000;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.save-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

/* ================= 动画与响应式 ================= */
.fade-in {
  animation: fadeInUP 0.8s ease backwards;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 900px) {
  .dashboard-content {
    flex-direction: column;
  }

  .profile-side {
    width: 100%;
    position: static;
  }

  .nav-bar {
    padding: 0 2rem;
  }
}
</style>