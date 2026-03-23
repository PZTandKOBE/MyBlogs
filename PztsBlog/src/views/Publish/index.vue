<template>
  <div class="publish-page-container">
    <div class="background-layer">
      <LightRays class="light-rays-bg" />
    </div>

    <header class="top-action-bar glass-panel">
      <div class="left-actions">
        <button class="icon-btn" @click="goBack" title="返回">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>返回</span>
        </button>
      </div>

      <div class="center-info">
        <span class="status-dot"></span>
        <span class="status-text">草稿自动保存中...</span>
      </div>

      <div class="right-actions">
        <input 
          type="file" 
          accept=".md" 
          ref="fileInputRef" 
          style="display: none" 
          @change="handleFileUpload" 
        />
        <button class="secondary-btn" @click="triggerFileInput">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          导入 .md 文件
        </button>
        <button class="primary-btn" @click="handlePublish">
          发布文章
        </button>
      </div>
    </header>

    <main class="editor-main-container">
      <div class="title-input-wrapper">
        <input 
          type="text" 
          v-model="articleTitle" 
          placeholder="请输入文章标题..." 
          class="title-input" 
          autocomplete="off"
        />
      </div>

      <div class="md-editor-wrapper">
        <MdEditor 
          v-model="articleContent" 
          theme="dark" 
          class="custom-md-editor"
          :toolbars="toolbars"
          placeholder="开始你的创作，或者点击右上角导入本地 Markdown 文件..."
        />
      </div>
    </main>

    <AlertModal
      v-model:visible="alertVisible"
      :type="alertType"
      :title="alertTitle"
      :message="alertMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AlertModal from '@/views/Error/index.vue';
// 引入 MdEditorV3 及其核心样式
import { MdEditor, type ToolbarNames } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import LightRays from '@/views/background/LightRays.vue';

const router = useRouter();

// 响应式状态绑定
const articleTitle = ref('');
const articleContent = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);

// 全局统一弹窗（替代原生 alert）
const alertVisible = ref(false);
const alertType = ref<'success' | 'error'>('success');
const alertTitle = ref('提示');
const alertMessage = ref('');

const showAlert = (payload: { type: 'success' | 'error'; title?: string; message: string }) => {
  alertType.value = payload.type;
  alertTitle.value = payload.title ?? '提示';
  alertMessage.value = payload.message;
  alertVisible.value = true;
};

// 自定义编辑器的工具栏配置（可根据你的需求增删）
const toolbars: ToolbarNames[] = [
  'bold', 'underline', 'italic', '-', 'strikeThrough', 'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-', 
  'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-', 
  'revoke', 'next', 'save', '=', 'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview', 'catalog'
];

// 返回上一页
const goBack = () => {
  router.back();
};

// 触发隐藏的 input 唤起文件选择框
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

// 核心逻辑：读取本地 .md 文件内容并写入编辑器
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  
  // 仅允许 .md 或文本文件
  if (!file.name.endsWith('.md') && file.type !== 'text/markdown' && file.type !== 'text/plain') {
    showAlert({
      type: 'error',
      message: '请上传标准的 Markdown (.md) 文件！'
    });
    target.value = ''; // 清空选中状态
    return;
  }

  // 使用 FileReader 读取文件内容
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === 'string') {
      articleContent.value = result;
      // 可选：将文件名作为默认标题（去掉 .md 后缀）
      if (!articleTitle.value) {
        articleTitle.value = file.name.replace(/\.md$/i, '');
      }
    }
  };
  
  reader.onerror = () => {
    showAlert({
      type: 'error',
      message: '读取文件失败，请重试！'
    });
  };

  reader.readAsText(file, 'UTF-8');
  // 读取完后清空 input 的 value，保证下次选同一个文件依然能触发 change 事件
  target.value = ''; 
};

// 发布逻辑占位
const handlePublish = () => {
  if (!articleTitle.value.trim()) {
    showAlert({
      type: 'error',
      message: '请填写文章标题！'
    });
    return;
  }
  if (!articleContent.value.trim()) {
    showAlert({
      type: 'error',
      message: '文章内容不能为空！'
    });
    return;
  }
  
  console.log('--- 准备发布 ---');
  console.log('标题:', articleTitle.value);
  console.log('内容:', articleContent.value);
  showAlert({
    type: 'success',
    message: '文章发布成功！(模拟)'
  });
  router.push('/user'); // 发布完跳回个人页
};
</script>

<style scoped>
/* 根容器，撑满全屏，防止原生滚动 */
.publish-page-container {
  width: 100%;
  height: 100vh;
  background-color: #000000;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: #ffffff;
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 纯黑与光线背景 */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
}

/* 毛玻璃顶部栏 */
.top-action-bar {
  position: relative;
  z-index: 10;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.left-actions, .right-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 中间草稿状态提示 */
.center-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}
.status-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981; /* 绿色圆点表示正常 */
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

/* 按钮基础通用样式 */
button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}
.btn-icon {
  width: 16px;
  height: 16px;
}

/* 导航图标按钮 */
.icon-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.5rem;
}
.icon-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}
.icon-btn svg {
  width: 20px;
  height: 20px;
}

/* 次要按钮 (导入文件) */
.secondary-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e5e5e5;
  padding: 0.5rem 1rem;
}
.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 主要按钮 (发布) */
.primary-btn {
  background: #ffffff;
  border: 1px solid #ffffff;
  color: #000000;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
}
.primary-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

/* 主体编辑区域，弹性布局占满剩余空间 */
.editor-main-container {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  min-height: 0; /* 修复 Flexbox 导致的高度溢出问题 */
}

/* 沉浸式大标题输入框 */
.title-input-wrapper {
  padding: 1.5rem 2rem 1rem 2rem;
}
.title-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  caret-color: #ffffff;
  font-family: inherit;
}
.title-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

/* 编辑器外部包裹，确保其能自由缩放自适应高度 */
.md-editor-wrapper {
  flex: 1;
  padding: 0 2rem 2rem 2rem;
  display: flex;
  min-height: 0; /* 修复 Flexbox 导致的高度溢出问题 */
}

/* 覆盖/优化 MdEditorV3 默认样式的细节，使其更契合系统 */
.custom-md-editor {
  flex: 1;
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
  /* 设置编辑器整体底层为更深邃的黑 */
  --md-bk-color: rgba(12, 12, 12, 0.8) !important; 
  backdrop-filter: blur(10px);
}

/* 微调编辑器内部组件的透明度，打造极致的黑暗简约感 */
:deep(.md-editor-toolbar-wrapper) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
:deep(.md-editor-content) {
  background: transparent !important;
}
:deep(.md-editor-footer) {
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>