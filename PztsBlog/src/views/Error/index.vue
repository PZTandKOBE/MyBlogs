<template>
    <Transition name="fade-scale">
      <div v-if="visible" class="alert-overlay" @click.self="handleCancel">
        <div class="alert-box" :class="type">
          <div class="icon-wrapper">
            <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <svg v-else-if="type === 'confirm'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
  
          <div class="content-wrapper">
            <h3 class="title">{{ title }}</h3>
            <p class="message">{{ message }}</p>
          </div>
  
          <div class="actions">
            <template v-if="type === 'confirm'">
              <button class="btn btn-cancel" @click="handleCancel">取消</button>
              <button class="btn btn-confirm" @click="handleConfirm">确认</button>
            </template>
            <template v-else>
              <button class="btn btn-primary" :class="type" @click="handleConfirm">知道了</button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'success', // 'success', 'error', 'confirm'
    },
    title: {
      type: String,
      default: '提示'
    },
    message: {
      type: String,
      default: '操作已执行'
    }
  })
  
  const emit = defineEmits(['update:visible', 'confirm', 'cancel'])
  
  const handleConfirm = () => {
    emit('confirm')
    emit('update:visible', false)
  }
  
  const handleCancel = () => {
    emit('cancel')
    emit('update:visible', false)
  }
  </script>
  
  <style scoped>
  /* 遮罩层：采用轻微的背景变暗配合毛玻璃效果，不突兀 */
  .alert-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  
  /* 提醒框主体：圆角、柔和阴影 */
  .alert-box {
    background: #ffffff;
    width: 90%;
    max-width: 400px;
    border-radius: 16px;
    padding: 32px 24px 24px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  /* 图标样式 */
  .icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .icon-wrapper svg {
    width: 28px;
    height: 28px;
  }
  
  /* 成功主题 */
  .alert-box.success .icon-wrapper {
    background: #ecfdf5;
    color: #10b981;
  }
  .btn.success { background: #10b981; color: white; }
  .btn.success:hover { background: #059669; }
  
  /* 失败主题 */
  .alert-box.error .icon-wrapper {
    background: #fef2f2;
    color: #ef4444;
  }
  .btn.error { background: #ef4444; color: white; }
  .btn.error:hover { background: #dc2626; }
  
  /* 二次确认主题 */
  .alert-box.confirm .icon-wrapper {
    background: #eff6ff;
    color: #3b82f6;
  }
  .btn.btn-confirm { background: #3b82f6; color: white; }
  .btn.btn-confirm:hover { background: #2563eb; }
  
  /* 文本内容 */
  .content-wrapper {
    margin-bottom: 28px;
  }
  
  .title {
    margin: 0 0 8px;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  .message {
    margin: 0;
    font-size: 0.95rem;
    color: #6b7280;
    line-height: 1.5;
  }
  
  /* 按钮组 */
  .actions {
    display: flex;
    gap: 12px;
    width: 100%;
  }
  
  .btn {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn-cancel {
    background: #f3f4f6;
    color: #4b5563;
  }
  
  .btn-cancel:hover {
    background: #e5e7eb;
  }
  
  /* Vue 过渡动画：淡入并带有轻微的缩放弹动感 */
  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .fade-scale-enter-from,
  .fade-scale-leave-to {
    opacity: 0;
  }
  
  .fade-scale-enter-from .alert-box,
  .fade-scale-leave-to .alert-box {
    transform: scale(0.95) translateY(10px);
  }
  </style>