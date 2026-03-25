<template>
  <div class="gallery-container">
    <div class="gallery-root">
      <div class="gallery-viewport">
        <Motion
          v-if="displayImages.length > 0"
          tag="div"
          class="gallery-track"
          :style="trackStyle"
          :animate="animateProps"
          :transition="springTransition"
          @mouseenter="handleMouseEnter" 
          @mouseleave="handleMouseLeave"
          @mousedown="handleMouseDown"
        >
          <div
            v-for="(url, i) in displayImages"
            :key="`gallery-${i}`"
            :style="getItemStyle(i)"
            class="gallery-item"
          >
            <img
              :src="url"
              alt="gallery"
              loading="lazy"
              decoding="async"
              class="gallery-img"
            />
          </div>
        </Motion>
        <div v-else class="empty-gallery">
          <p>相册空空如也，快来上传第一张照片吧！</p>
        </div>
      </div>
    </div>

    <div v-if="isLoggedIn" class="gallery-actions">
      <button class="upload-btn" @click="showUploadModal = true">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        上传新图片
      </button>
    </div>

    <div v-if="showUploadModal" class="upload-modal-overlay" @click.self="closeModal">
      <div class="upload-modal">
        <h3 class="modal-title">上传图片到相册</h3>
        
        <div class="upload-area" @click="triggerFileInput" :class="{ 'has-file': selectedFile }">
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden-input" 
            accept="image/*" 
            @change="handleFileChange"
          />
          <div v-if="!selectedFile" class="upload-placeholder">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="upload-icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <p>点击此处选择图片</p>
            <p class="upload-tip">支持 JPG, PNG，大小限制 10MB</p>
          </div>
          <div v-else class="file-info">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="change-file-tip">点击重新选择</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal" :disabled="isUploading">取消</button>
          <button class="btn-confirm" @click="handleUpload" :disabled="!selectedFile || isUploading">
            {{ isUploading ? '正在上传...' : '确认上传' }}
          </button>
        </div>
      </div>
    </div>

    <CustomAlert
      v-model:visible="alertVisible"
      :type="alertType"
      :title="alertTitle"
      :message="alertMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { Motion } from 'motion-v';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { getImageListApi, uploadImageApi } from '@/api/media';
// 引入你写好的全局提醒框组件
import CustomAlert from '@/views/Error/index.vue';

interface RollingGalleryProps {
  autoplay?: boolean;
  pauseOnHover?: boolean;
  images?: string[];
}

const props = withDefaults(defineProps<RollingGalleryProps>(), {
  autoplay: false,
  pauseOnHover: false,
  images: () => []
});

// === 提醒框状态 ===
const alertVisible = ref(false);
const alertType = ref('success');
const alertTitle = ref('');
const alertMessage = ref('');

const showAlert = (type: string, title: string, message: string) => {
  alertType.value = type;
  alertTitle.value = title;
  alertMessage.value = message;
  alertVisible.value = true;
};

// === 接口交互与组件状态 ===
const fetchedImages = ref<string[]>([]);
const showUploadModal = ref(false);
const isUploading = ref(false);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// 🌟 修改点 2：定义登录状态的响应式变量
const isLoggedIn = ref(false);

const isScreenSizeSm = ref(false);
const rotateYValue = ref(0);
const autoplayInterval = ref<ReturnType<typeof setInterval> | null>(null);
const autoplayTimeout = ref<ReturnType<typeof setInterval> | null>(null);
const isDragging = ref(false);
const isHovered = ref(false);
const dragStartX = ref(0);
const dragStartRotation = ref(0);

// 动态数据对接：完全依赖 props.images 或 fetchedImages，不使用默认写死图片
const displayImages = computed(() => {
  const sourceImages = fetchedImages.value.length > 0 ? fetchedImages.value : props.images;
  
  if (sourceImages.length === 0) {
    return [];
  }

  const maxImages = REFERENCE_FACE_COUNT_SPACING;

  if (sourceImages.length >= maxImages) {
    return sourceImages;
  }

  const repeatedImages = [];
  const repetitions = Math.ceil(maxImages / sourceImages.length);

  for (let i = 0; i < repetitions; i++) {
    repeatedImages.push(...sourceImages);
  }

  return repeatedImages.slice(0, maxImages);
});

const cylinderWidth = computed(() => (isScreenSizeSm.value ? 1800 : 3400));
const faceWidth = computed(() => {
  return (cylinderWidth.value / REFERENCE_FACE_COUNT_SIZING) * 1.5;
});
const radius = computed(() => cylinderWidth.value / (2 * Math.PI));

const DRAG_FACTOR = Object.freeze(0.15);
const MOMENTUM_FACTOR = Object.freeze(0.05);
const AUTOPLAY_INTERVAL = Object.freeze(2000);
const DRAG_RESTART_DELAY = Object.freeze(1500);
const HOVER_RESTART_DELAY = Object.freeze(100);
const HOVER_DEBOUNCE_DELAY = Object.freeze(50);
const REFERENCE_FACE_COUNT_SPACING = Object.freeze(10);
const REFERENCE_FACE_COUNT_SIZING = Object.freeze(10);

const trackStyle = computed(() => ({
  width: `${cylinderWidth.value}px`,
  transformStyle: 'preserve-3d' as const
}));

const animateProps = computed(() => ({
  rotateY: rotateYValue.value
}));

const springTransition = computed(() => {
  if (isDragging.value) {
    return { duration: 0 };
  } else {
    return {
      duration: 0.8,
      ease: 'easeOut' as const
    };
  }
});

const styleCache = new Map<string, { width: string; transform: string }>();

const getItemStyle = (index: number) => {
  const cacheKey = `${index}-${faceWidth.value}-${radius.value}`;

  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey)!;
  }

  const style = {
    width: `${faceWidth.value}px`,
    transform: `rotateY(${index * (360 / REFERENCE_FACE_COUNT_SPACING)}deg) translateZ(${radius.value}px)`
  };

  if (styleCache.size > 50) {
    styleCache.clear();
  }

  styleCache.set(cacheKey, style);
  return style;
};

let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

function checkScreenSize() {
  isScreenSizeSm.value = window.innerWidth <= 640;
}

function throttledResize() {
  if (resizeTimeout) return;
  resizeTimeout = setTimeout(() => {
    checkScreenSize();
    resizeTimeout = null;
  }, 100);
}

function handleMouseDown(event: MouseEvent) {
  if (displayImages.value.length === 0) return;
  
  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartRotation.value = rotateYValue.value;

  stopAutoplay();

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('mouseup', handleMouseUp, { passive: true });
  event.preventDefault();
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value) return;

  const deltaX = event.clientX - dragStartX.value;
  const rotationDelta = deltaX * DRAG_FACTOR;
  rotateYValue.value = dragStartRotation.value + rotationDelta;
}

function handleMouseUp(event: MouseEvent) {
  if (!isDragging.value) return;

  isDragging.value = false;

  const deltaX = event.clientX - dragStartX.value;
  const velocity = deltaX * MOMENTUM_FACTOR;
  rotateYValue.value += velocity;

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);

  stopAutoplay();

  if (props.autoplay) {
    if (props.pauseOnHover && isHovered.value) {
      return;
    } else {
      autoplayTimeout.value = setTimeout(() => {
        if (!isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
          startAutoplay();
        }
      }, DRAG_RESTART_DELAY);
    }
  }
}

function startAutoplay() {
  if (!props.autoplay || isDragging.value || (props.pauseOnHover && isHovered.value) || displayImages.value.length === 0) return;

  stopAutoplay();

  autoplayInterval.value = setInterval(() => {
    if (!isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
      rotateYValue.value -= 360 / REFERENCE_FACE_COUNT_SPACING;
    }
  }, AUTOPLAY_INTERVAL);
}

function stopAutoplay() {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
  if (autoplayTimeout.value) {
    clearTimeout(autoplayTimeout.value);
    autoplayTimeout.value = null;
  }
}

function handleMouseEnter() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hoverTimeout = setTimeout(() => {
    isHovered.value = true;

    if (props.autoplay && props.pauseOnHover && !isDragging.value) {
      stopAutoplay();
    }
  }, HOVER_DEBOUNCE_DELAY);
}

function handleMouseLeave() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }

  hoverTimeout = setTimeout(() => {
    isHovered.value = false;

    if (props.autoplay && props.pauseOnHover && !isDragging.value) {
      stopAutoplay();
      autoplayTimeout.value = setTimeout(() => {
        if (props.autoplay && !isDragging.value && !isHovered.value) {
          startAutoplay();
        }
      }, HOVER_RESTART_DELAY);
    }
  }, HOVER_DEBOUNCE_DELAY);
}

// === 接口交互与弹窗逻辑 ===
const fetchImages = async () => {
  try {
    const res = await getImageListApi();
    if (res.code === 200 && Array.isArray(res.data)) {
      fetchedImages.value = res.data;
      // 重新拉取到图片后，判断是否需要启动自动播放
      if (props.autoplay && fetchedImages.value.length > 0) {
        startAutoplay();
      }
    }
  } catch (error) {
    console.error('获取图片列表失败:', error);
  }
};

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click();
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    // 校验大小：限制 10MB
    if (file.size > 10 * 1024 * 1024) {
      showAlert('error', '校验失败', '图片大小不能超过 10MB！');
      target.value = '';
      return;
    }
    selectedFile.value = file;
  }
};

const closeModal = () => {
  if (isUploading.value) return;
  showUploadModal.value = false;
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleUpload = async () => {
  if (!selectedFile.value) return;
  
  isUploading.value = true;
  try {
    const res = await uploadImageApi(selectedFile.value);
    if (res.code === 200) {
      // 成功提示
      showAlert('success', '上传成功', '新图片已成功添加到相册！');
      // 上传成功后刷新图片墙列表
      await fetchImages();
      closeModal();
    } else {
      showAlert('error', '上传失败', res.message || '上传请求失败，请重试');
    }
  } catch (error) {
    console.error('上传图片失败:', error);
    showAlert('error', '网络错误', '请求发生错误，请检查网络或后端状态');
  } finally {
    isUploading.value = false;
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', throttledResize, { passive: true });

  // 🌟 修改点 3：检查 localStorage 中是否存在 token，更新登录状态
  isLoggedIn.value = !!localStorage.getItem('token');

  // 挂载时拉取真实图片数据
  fetchImages();
});

onUnmounted(() => {
  window.removeEventListener('resize', throttledResize);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  stopAutoplay();
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
    hoverTimeout = null;
  }
});

watch(
  () => props.autoplay,
  newVal => {
    stopAutoplay();
    if (newVal && !isDragging.value && (!props.pauseOnHover || !isHovered.value) && displayImages.value.length > 0) {
      autoplayTimeout.value = setTimeout(() => {
        if (!isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
          startAutoplay();
        }
      }, HOVER_RESTART_DELAY);
    }
  }
);

watch(
  () => props.pauseOnHover,
  () => {
    if (props.autoplay && displayImages.value.length > 0) {
      stopAutoplay();
      if (!isDragging.value && (!props.pauseOnHover || !isHovered.value)) {
        startAutoplay();
      }
    }
  }
);
</script>

<style scoped>
/* 样式部分保持不变 */
.gallery-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.gallery-root {
  position: relative;
  width: 100%;
  height: 400px; 
}

.gallery-viewport {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  transform-style: preserve-3d;
  perspective: 1200px; 
}

.gallery-track {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 200px;
  transform-style: preserve-3d;
  cursor: grab;
  user-select: none;
  will-change: transform;
}

.gallery-track:active {
  cursor: grabbing;
}

.gallery-item {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8%;
  backface-visibility: hidden;
  pointer-events: none;
  will-change: transform;
}

.gallery-img {
  border: 2px solid rgba(255, 255, 255, 0.4); 
  border-radius: 12px;
  width: 260px; 
  height: 160px; 
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
  pointer-events: auto;
  will-change: transform;
}

.gallery-img:hover {
  transform: scale(1.05);
}

.empty-gallery {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  letter-spacing: 1px;
}

.gallery-actions {
  margin-top: 10px;
  z-index: 10;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.upload-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.upload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.upload-modal {
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 420px;
  color: #fff;
  text-align: center;
  animation: slideUp 0.3s ease;
}

.modal-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
}

.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px 20px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.upload-area:hover, .upload-area.has-file {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.6);
}

.hidden-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.upload-icon {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.6);
}

.upload-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  word-break: break-all;
}

.change-file-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 12px 0;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.btn-confirm {
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  font-weight: 500;
}

.btn-confirm:hover:not(:disabled) {
  background: #fff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
}

.btn-cancel:disabled, .btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>