<template>
    <div class="user-info-container">
      <div class="background-layer">
        <LightRays class="light-rays-bg" />
      </div>
  
      <div class="nav-bar">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                <span class="avatar-text">{{ userInfo.username.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            
            <div class="user-badges">
              <span class="badge role">正式会员</span>
              <span class="badge date">注册于 2026-03</span>
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
              <!-- <div class="stat-item">
                <span class="num">5</span>
                <span class="label">文章收藏</span>
              </div> -->
            </div>
  
            <div class="side-actions">
              <button class="edit-btn" @click="showEditModal = true">修改资料</button>
              <button class="logout-btn" @click="handleLogout">退出登录</button>
            </div>
          </div>
  
          <div class="right-side">
            <div class="articles-side glass-panel">
              <h2 class="section-title">我的文章 <span>/ Published Articles</span></h2>
              
              <div v-if="publishedArticles.length === 0" class="empty-state">
                暂无发表的文章，去工作台写一篇吧！
              </div>
              
              <div v-else class="article-list">
                <div class="article-item" v-for="article in publishedArticles" :key="article.id">
                  <div class="article-header">
                    <h3 class="article-title">{{ article.title }}</h3>
                    <span class="status-pill" :class="article.status">{{ article.statusText }}</span>
                  </div>
                  <div class="article-meta">
                    <span class="meta-item">发布于：{{ article.date }}</span>
                    <span class="meta-item">阅读量：{{ article.views }}</span>
                  </div>
                </div>
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

      <AlertModal
        v-model:visible="alertVisible"
        :type="alertType"
        :title="alertTitle"
        :message="alertMessage"
        @confirm="handleAlertConfirm"
        @cancel="handleAlertCancel"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import LightRays from '@/views/background/LightRays.vue';
  import AlertModal from '@/views/Error/index.vue';
  
  const router = useRouter();
  
  const alertVisible = ref(false);
  const alertType = ref<'success' | 'error' | 'confirm'>('success');
  const alertTitle = ref('提示');
  const alertMessage = ref('');
  const pendingRedirect = ref(false);

  const showAlert = ({
    type = 'success',
    title = '提示',
    message
  }: {
    type?: 'success' | 'error' | 'confirm';
    title?: string;
    message: string;
  }) => {
    alertType.value = type;
    alertTitle.value = title;
    alertMessage.value = message;
    alertVisible.value = true;
  };

  const handleAlertConfirm = () => {
    if (!pendingRedirect.value) return;
    pendingRedirect.value = false;
    router.push('/');
  };

  const handleAlertCancel = () => {
    pendingRedirect.value = false;
  };

  // 控制修改资料弹窗的显隐
  const showEditModal = ref(false);
  
  // 模拟用户信息数据
  const userInfo = ref({
    username: '彭梓涛',
    email: 'pengzitao@example.com',
    bio: '保持热爱，奔赴山海。'
  });
  
  // 模拟用户发表的文章数据
  const publishedArticles = ref([
    {
      id: 1,
      title: '探索 Vue3 组合式 API 的无限可能',
      date: '2026-03-15',
      views: 1250,
      status: 'published',
      statusText: '已发布'
    },
    {
      id: 2,
      title: '如何在 Vite 项目中优雅地配置 TailwindCSS',
      date: '2026-03-10',
      views: 890,
      status: 'published',
      statusText: '已发布'
    },
    {
      id: 3,
      title: '前端动画进阶：GSAP 结合 WebGL',
      date: '2026-03-16',
      views: 0,
      status: 'draft',
      statusText: '草稿'
    }
  ]);
  
  const goBack = () => {
    router.push('/'); 
  };
  
  const saveProfile = () => {
    // 模拟保存逻辑
    showEditModal.value = false;
    pendingRedirect.value = false;
    showAlert({
      type: 'success',
      message: '资料保存成功！'
    });
  };
  
  const handleLogout = () => {
    localStorage.removeItem('isLogin');
    pendingRedirect.value = true;
    showAlert({
      type: 'success',
      message: '已退出登录！'
    });
  };
  </script>
  
  <style scoped>
  /* 核心容器与防横向滚动 */
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
      pointer-events: none;
      opacity: 0.6;
  }

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
      transition: all 0.3s;
  }

  .back-btn:hover {
      color: #fff;
      transform: translateX(-5px);
  }

  .back-btn svg {
      width: 20px;
      height: 20px;
  }

  /* 布局调整 */
  .dashboard-layout {
      position: relative;
      z-index: 10;
      width: 100%;
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

  /* 毛玻璃面板通用 */
  .glass-panel {
      background: rgba(20, 20, 20, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2rem;
  }

  /* ================= 左侧栏 ================= */
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

  .avatar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
  }

  .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #333, #111);
      border: 2px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  }

  .user-badges {
      display: flex;
      gap: 0.5rem;
  }

  .badge {
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
  }

  .badge.role {
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
  }

  /* 用户信息文本区 */
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
      margin-bottom: 1rem;
      font-family: "Fira Code", monospace;
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
      margin-top: 0.5rem;
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
      color: #fff;
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

  /* ================= 右侧栏（纯净文章列表） ================= */
  .right-side {
      flex: 1;
      width: 100%;
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

  .section-title span {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.3);
      font-weight: 400;
  }

  .empty-state {
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      padding: 2rem 0;
      font-size: 0.9rem;
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
      padding: 1.2rem 1.5rem;
      transition: all 0.3s ease;
      cursor: pointer;
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
      color: #fff;
      margin: 0;
      transition: color 0.3s;
  }

  .article-item:hover .article-title {
      color: #00f2ea;
  }

  .status-pill {
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-weight: 500;
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
      gap: 1.5rem;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.4);
      font-family: "Fira Code", monospace;
  }

  /* ================= 弹窗 Modal 样式 ================= */
  .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
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
      animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal-title {
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      font-weight: 600;
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
      font-size: 1rem;
      font-family: inherit;
      outline: none;
      transition: all 0.3s;
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
      border: none;
      color: #000;
      font-weight: 600;
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
  }

  .save-btn:hover {
      background: #e0e0e0;
      transform: translateY(-1px);
  }

  /* 动画 */
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
  }

  </style>