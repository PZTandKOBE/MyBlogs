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
          <img :src="comment.user?.avatar || defaultAvatar" alt="avatar" class="user-avatar" />
          <div class="comment-content-box">
            <div class="user-info">
              <span class="user-name">{{ comment.user?.name || '匿名用户' }}</span>
              <span class="comment-time">{{ comment.time || '刚刚' }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
            <div class="comment-actions">
              <button class="action-btn" :class="{ active: comment.isLiked }" @click="toggleLike(comment)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                {{ comment.likes > 0 ? comment.likes : '点赞' }}
              </button>
              <button class="action-btn" @click="openReplyBox(comment.id, comment.user?.name)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                回复
              </button>
            </div>
          </div>
        </div>

        <div class="replies-container" v-if="comment.replies && comment.replies.length > 0">
          <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
            <img :src="reply.user?.avatar || defaultAvatar" alt="avatar" class="user-avatar small-avatar" />
            <div class="comment-content-box">
              <div class="user-info">
                <span class="user-name">{{ reply.user?.name || '匿名用户' }}</span>
                <span class="reply-badge" v-if="reply.replyTo">回复 <span class="highlight-name">@{{ reply.replyTo }}</span></span>
                <span class="comment-time">{{ reply.time || '刚刚' }}</span>
              </div>
              <p class="comment-text">{{ reply.content }}</p>
              <div class="comment-actions">
                <button class="action-btn" :class="{ active: reply.isLiked }" @click="toggleLike(reply)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  {{ reply.likes > 0 ? reply.likes : '点赞' }}
                </button>
                <button class="action-btn" @click="openReplyBox(comment.id, reply.user?.name)">
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
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { getCommentListApi, publishCommentApi } from '@/api/comment';
import { getCurrentUserApi } from '@/api/user';

const props = defineProps({
  articleId: {
    type: [String, Number],
    required: true
  }
});

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest&backgroundColor=1a1a1a';

// 登录用户信息（给个初始默认值）
const currentUser = ref({
  id: null as string | number | null,
  name: '游客',
  avatar: defaultAvatar
});

const comments = ref<any[]>([]);

const totalComments = computed(() => {
  return comments.value.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0);
});

// 状态控制
const mainCommentText = ref('');
const activeReplyId = ref<number | null>(null);
const replyTargetName = ref('');
const replyText = ref('');
const replyInputRef = ref<HTMLTextAreaElement | null>(null);

// ================== API 交互逻辑 ==================

// 1. 获取当前登录用户信息
const fetchCurrentUser = async () => {
  try {
    const res = await getCurrentUserApi();
    if (res && res.data) {
      currentUser.value = {
        id: res.data.id || null,
        name: res.data.username || '当前用户',
        avatar: res.data.avatar || res.data.avatarUrl || defaultAvatar
      };
    }
  } catch (error) {
    console.log('用户未登录或Token失效，使用默认游客头像');
  }
};

// 2. 获取评论列表
const fetchComments = async () => {
  if (!props.articleId) return;
  try {
    const res = await getCommentListApi(props.articleId);
    if (res && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
      
      comments.value = list.map((item: any) => {
        // 抹平后端字段差异
        let userName = item.authorName || '匿名用户';
        let userAvatar = defaultAvatar;

        if (item.user) {
          userName = item.user.name || item.user.username || userName;
          userAvatar = item.user.avatar || item.user.avatarUrl || userAvatar;
        } else if (item.userId && item.userId === currentUser.value.id) {
          // 如果后端没联表返回用户信息，但刚好是自己发的，就用自己的信息展示
          userName = currentUser.value.name;
          userAvatar = currentUser.value.avatar;
        }

        return {
          ...item,
          user: { name: userName, avatar: userAvatar },
          replies: item.replies || [],
          likes: item.likes || 0,
          isLiked: false
        };
      });
    }
  } catch (error) {
    console.error('获取评论列表失败:', error);
  }
};

// 3. 提交主评论 (乐观更新)
const submitMainComment = async () => {
  if (!mainCommentText.value.trim()) return;
  
  const textToPublish = mainCommentText.value;
  
  // 乐观更新：不等后端返回，前端直接先把评论怼上去，极致流畅
  const newComment = {
    id: Date.now(),
    user: { name: currentUser.value.name, avatar: currentUser.value.avatar },
    content: textToPublish,
    time: '刚刚',
    likes: 0,
    isLiked: false,
    replies: []
  };
  comments.value.unshift(newComment);
  mainCommentText.value = '';

  try {
    await publishCommentApi({
      articleId: props.articleId,
      content: textToPublish,
      imageUrl: '' 
    });
    // 可选：真正发布成功后静默拉取一下最新列表同步其他人的评论
    // fetchComments();
  } catch (error) {
    console.error('发布评论失败:', error);
    comments.value.shift(); // 如果发布失败，把刚才塞进去的假评论撤回来
    alert('发布失败，请确保您已登录！');
  }
};

// 4. 打开回复框
const openReplyBox = (commentId: number, targetName?: string) => {
  activeReplyId.value = commentId;
  replyTargetName.value = targetName || comments.value.find(c => c.id === commentId)?.user.name || '匿名';
  replyText.value = '';
  nextTick(() => {
    replyInputRef.value?.focus();
  });
};

// 5. 提交楼中楼回复 (乐观更新)
const submitReply = async (commentId: number) => {
  if (!replyText.value.trim()) return;
  
  const targetComment = comments.value.find(c => c.id === commentId);
  const textToPublish = replyText.value;
  const finalContent = `回复 @${replyTargetName.value} : ${textToPublish}`;
  
  // 乐观更新
  const newReply = {
    id: Date.now(),
    user: { name: currentUser.value.name, avatar: currentUser.value.avatar },
    replyTo: replyTargetName.value,
    content: textToPublish,
    time: '刚刚',
    likes: 0,
    isLiked: false
  };

  if (targetComment) {
    if (!targetComment.replies) targetComment.replies = [];
    targetComment.replies.push(newReply);
  }
  
  activeReplyId.value = null;
  replyText.value = '';

  try {
    await publishCommentApi({
      articleId: props.articleId,
      content: finalContent,
      imageUrl: '',
      parentId: commentId 
    });
  } catch (error) {
    console.error('回复失败:', error);
    if (targetComment) targetComment.replies.pop(); // 失败则撤回
    alert('回复失败，请确保您已登录！');
  }
};

// ================== 前端交互 ==================

const toggleLike = (item: any) => {
  item.isLiked = !item.isLiked;
  item.likes += item.isLiked ? 1 : -1;
};

// 初始化
onMounted(() => {
  // 并行拉取用户信息和评论列表
  fetchCurrentUser().then(() => {
    fetchComments();
  });
});

// 监听文章ID变化，重新加载评论
watch(() => props.articleId, () => {
  fetchComments();
});
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
  object-fit: cover;
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
  color: #3b82f6; 
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
  color: #ef4444; 
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