<template>
    <div class="comment-container">
      <div class="comment-header">
        <h3>评论区 <span>({{ totalComments }})</span></h3>
      </div>
  
      <div class="main-input-area">
        <img :src="currentUser.avatar" alt="avatar" class="user-avatar" />
        <div class="input-wrapper">
          <textarea 
            v-model="mainCommentText" 
            placeholder="写下你的评论..." 
            rows="3"
          ></textarea>
          <div class="input-actions">
            <span class="word-count">{{ mainCommentText.length }} / 500</span>
            <button 
              class="submit-btn" 
              :disabled="!mainCommentText.trim()"
              @click="submitMainComment"
            >
              发布评论
            </button>
          </div>
        </div>
      </div>
  
      <div class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-main">
            <img :src="comment.user.avatar" alt="avatar" class="user-avatar" />
            <div class="comment-content-box">
              <div class="user-info">
                <span class="user-name">{{ comment.user.name }}</span>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-actions">
                <button class="action-btn" :class="{ active: comment.isLiked }" @click="toggleLike(comment)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  {{ comment.likes > 0 ? comment.likes : '点赞' }}
                </button>
                <button class="action-btn" @click="openReplyBox(comment.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  回复
                </button>
              </div>
            </div>
          </div>
  
          <div class="replies-container" v-if="comment.replies && comment.replies.length > 0">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <img :src="reply.user.avatar" alt="avatar" class="user-avatar small-avatar" />
              <div class="comment-content-box">
                <div class="user-info">
                  <span class="user-name">{{ reply.user.name }}</span>
                  <span class="reply-badge" v-if="reply.replyTo">回复 <span class="highlight-name">@{{ reply.replyTo }}</span></span>
                  <span class="comment-time">{{ reply.time }}</span>
                </div>
                <p class="comment-text">{{ reply.content }}</p>
                <div class="comment-actions">
                  <button class="action-btn" :class="{ active: reply.isLiked }" @click="toggleLike(reply)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    {{ reply.likes > 0 ? reply.likes : '点赞' }}
                  </button>
                  <button class="action-btn" @click="openReplyBox(comment.id, reply.user.name)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    回复
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <div class="reply-input-area" v-if="activeReplyId === comment.id">
            <textarea 
              v-model="replyText" 
              :placeholder="`回复 @${replyTargetName} :`" 
              rows="2"
              ref="replyInputRef"
            ></textarea>
            <div class="reply-input-actions">
              <button class="cancel-btn" @click="activeReplyId = null">取消</button>
              <button class="submit-btn small-btn" :disabled="!replyText.trim()" @click="submitReply(comment.id)">回复</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, nextTick } from 'vue';
  
  // 当前登录用户 (模拟)
  const currentUser = ref({
    name: '彭梓涛',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peng&backgroundColor=1a1a1a'
  });
  
  // 模拟评论数据
  const comments = ref([
    {
      id: 1,
      user: { name: '郑碧滢', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zheng&backgroundColor=1a1a1a' },
      content: '博客系统前端界面质感很不错，继续保持开发进度！',
      time: '2小时前',
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: 101,
          user: { name: '彭梓涛', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peng&backgroundColor=1a1a1a' },
          replyTo: '郑碧滢',
          content: '收到！评论区“楼中楼”功能已经整合进来了。',
          time: '1小时前',
          likes: 5,
          isLiked: false,
        }
      ]
    },
    {
      id: 2,
      user: { name: '黄思涵', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huang&backgroundColor=1a1a1a' },
      content: '这个深色毛玻璃主题配合动画效果太惊艳了。',
      time: '3小时前',
      likes: 8,
      isLiked: false,
      replies: []
    }
  ]);
  
  const totalComments = computed(() => {
    return comments.value.reduce((total, comment) => total + 1 + comment.replies.length, 0);
  });
  
  // 状态控制
  const mainCommentText = ref('');
  const activeReplyId = ref<number | null>(null);
  const replyTargetName = ref('');
  const replyText = ref('');
  const replyInputRef = ref<HTMLTextAreaElement | null>(null);
  
  // 发布主评论
  const submitMainComment = () => {
    if (!mainCommentText.value.trim()) return;
    comments.value.unshift({
      id: Date.now(),
      user: { ...currentUser.value },
      content: mainCommentText.value,
      time: '刚刚',
      likes: 0,
      isLiked: false,
      replies: []
    });
    mainCommentText.value = '';
  };
  
  // 打开回复框
  const openReplyBox = (commentId: number, targetName?: string) => {
    activeReplyId.value = commentId;
    replyTargetName.value = targetName || comments.value.find(c => c.id === commentId)?.user.name || '';
    replyText.value = '';
    nextTick(() => {
      replyInputRef.value?.focus();
    });
  };
  
  // 提交回复
  const submitReply = (commentId: number) => {
    if (!replyText.value.trim()) return;
    const targetComment = comments.value.find(c => c.id === commentId);
    if (targetComment) {
      targetComment.replies.push({
        id: Date.now(),
        user: { ...currentUser.value },
        replyTo: replyTargetName.value,
        content: replyText.value,
        time: '刚刚',
        likes: 0,
        isLiked: false
      });
    }
    activeReplyId.value = null;
    replyText.value = '';
  };
  
  // 点赞交互
  const toggleLike = (item: any) => {
    item.isLiked = !item.isLiked;
    item.likes += item.isLiked ? 1 : -1;
  };
  </script>
  
  <style scoped>
  .comment-container {
    width: 787px;
    color: #ffffff;
    font-family: inherit;
    background: rgba(10, 10, 10, 0.4);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
  }
  
  .comment-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .comment-header span {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
  }
  
  /* 输入区通用样式 */
  textarea {
    width: 95%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    color: #ffffff;
    font-size: 0.95rem;
    resize: vertical;
    outline: none;
    transition: all 0.3s ease;
  }
  textarea:focus {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
  }
  
  .main-input-area {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  
  .user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }
  .small-avatar {
    width: 36px;
    height: 36px;
  }
  
  .input-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .input-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .word-count {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.3);
  }
  
  /* 按钮样式 */
  button {
    cursor: pointer;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  .submit-btn {
    background: #ffffff;
    color: #000000;
    padding: 0.6rem 1.5rem;
  }
  .submit-btn:disabled {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.4);
    cursor: not-allowed;
  }
  .submit-btn:not(:disabled):hover {
    background: #e0e0e0;
    transform: translateY(-1px);
  }
  .submit-btn.small-btn {
    padding: 0.4rem 1.2rem;
    font-size: 0.9rem;
  }
  .cancel-btn {
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    padding: 0.4rem 1rem;
  }
  .cancel-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
  }
  
  /* 评论列表 */
  .comment-item {
    margin-bottom: 2rem;
  }
  .comment-main, .reply-item {
    display: flex;
    gap: 1.2rem;
  }
  .reply-item {
    margin-top: 1.5rem;
  }
  
  .comment-content-box {
    flex: 1;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.4rem;
  }
  .user-name {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
  .comment-time {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
  }
  .reply-badge {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }
  .highlight-name {
    color: #3b82f6; /* 可略微带有品牌色或高亮色 */
  }
  
  .comment-text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.8rem;
    white-space: pre-wrap;
  }
  
  .comment-actions {
    display: flex;
    gap: 1.5rem;
  }
  .action-btn {
    background: transparent;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0;
    font-size: 0.85rem;
  }
  .action-btn svg {
    width: 16px;
    height: 16px;
  }
  .action-btn:hover {
    color: #ffffff;
  }
  .action-btn.active {
    color: #ef4444; /* 点赞后的红色 */
  }
  
  /* 楼中楼容器 */
  .replies-container {
    margin-top: 1.5rem;
    margin-left: 3.5rem;
    padding-left: 1.5rem;
    border-left: 2px solid rgba(255, 255, 255, 0.08);
  }
  
  /* 楼中楼回复输入框 */
  .reply-input-area {
    margin-top: 1.5rem;
    margin-left: 3.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  .reply-input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  </style>