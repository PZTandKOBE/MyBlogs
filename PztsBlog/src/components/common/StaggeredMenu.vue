<template>
  <div class="sm-scope">
    <div :class="[(className ? className : ''), 'staggered-menu-wrapper'].join(' ')"
      :style="accentColor ? { '--sm-accent': accentColor } : undefined" :data-position="position"
      :data-open="open || undefined">
      <div ref="preLayersRef" class="sm-prelayers" aria-hidden="true">
        <div v-for="(color, index) in processedColors" :key="index" class="sm-prelayer"
          :style="{ background: color }" />
      </div>

      <header class="staggered-menu-header" aria-label="Main navigation header">
        <button ref="toggleBtnRef" class="sm-toggle" :aria-label="open ? 'Close menu' : 'Open menu'"
          :aria-expanded="open" aria-controls="staggered-menu-panel" @click="toggleMenu" type="button">
          <span ref="textWrapRef" class="sm-toggle-textWrap" aria-hidden="true">
            <span ref="textInnerRef" class="sm-toggle-textInner">
              <span v-for="(line, index) in textLines" :key="index" class="sm-toggle-line">
                {{ line }}
              </span>
            </span>
          </span>

          <span ref="iconRef" class="sm-icon" aria-hidden="true">
            <span ref="plusHRef" class="sm-icon-line" />
            <span ref="plusVRef" class="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      <aside id="staggered-menu-panel" ref="panelRef" class="staggered-menu-panel" :aria-hidden="!open">
        <div class="sm-panel-inner">
          <div class="ai-chat-container" ref="chatContainerRef">
            <div class="ai-chat-header">
              <h2 class="ai-title">Pzts AI Assistant</h2>
              <p class="ai-subtitle">基于 RAG 知识库的智能问答</p>
            </div>

            <div class="ai-messages-wrapper" ref="msgScrollRef">
              <div v-for="(msg, index) in chatHistory" :key="index"
                :class="['msg-bubble', msg.role === 'user' ? 'user-msg' : 'ai-msg']">
                <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
                <div v-if="msg.sources && msg.sources.length > 0" class="msg-sources">
                  <span class="source-label">参考来源:</span>
                  <a v-for="source in msg.sources" :key="source.id" :href="`/article/${source.id}`" target="_blank"
                    class="source-tag">
                    {{ source.title }}
                  </a>
                </div>
              </div>
              <div v-if="isLoading" class="ai-loading-placeholder">
                <div class="dot-typing"></div>
              </div>
            </div>

            <div class="ai-input-area">
              <div v-if="!isLoggedIn" class="login-mask">
                <button @click="goToLogin" class="auth-btn">请先登录以使用 AI</button>
              </div>
              <div v-else class="input-wrapper">
                <input v-model="userInput" @keyup.enter="handleSendMessage" placeholder="问问 AI 你的博客..."
                  :disabled="isLoading" />
                <button @click="handleSendMessage" :disabled="isLoading || !userInput.trim()">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/utils/request';
import MarkdownIt from 'markdown-it';

// --- 基础配置 ---
const md = new MarkdownIt();
const router = useRouter();

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

const props = withDefaults(defineProps<StaggeredMenuProps>(), {
  position: 'right',
  colors: () => ['#9EF2B2', '#27FF64'],
  menuButtonColor: '#fff',
  openMenuButtonColor: '#000',
  changeMenuColorOnOpen: true,
  accentColor: '#27FF64'
});

// --- 核心响应式状态 ---
const open = ref(false);
const openRef = ref(false);
const userInput = ref('');
const isLoading = ref(false);
const chatHistory = ref<any[]>([
  { role: 'ai', content: '你好，彭梓涛！我是你的 RAG 助手，有什么可以帮你的吗？', sources: [] }
]);

// --- 模板引用 ---
const panelRef = useTemplateRef('panelRef');
const preLayersRef = useTemplateRef('preLayersRef');
const preLayerElsRef = ref<HTMLElement[]>([]);
const plusHRef = useTemplateRef('plusHRef');
const plusVRef = useTemplateRef('plusVRef');
const iconRef = useTemplateRef('iconRef');
const textInnerRef = useTemplateRef('textInnerRef');
const toggleBtnRef = useTemplateRef('toggleBtnRef');
const chatContainerRef = ref<HTMLElement | null>(null);
const msgScrollRef = ref<HTMLElement | null>(null);

// --- 动画引用 ---
const openTlRef = ref<gsap.core.Timeline | null>(null);
const closeTweenRef = ref<gsap.core.Tween | null>(null);
const spinTweenRef = ref<gsap.core.Timeline | null>(null);
const textCycleAnimRef = ref<gsap.core.Tween | null>(null);
const colorTweenRef = ref<gsap.core.Tween | null>(null);
const busyRef = ref(false);
const textLines = ref<string[]>(['Ask me', 'Close']);

// --- 状态计算 ---
const isLoggedIn = computed(() => !!localStorage.getItem('token'));
const processedColors = computed(() => {
  const raw = props.colors && props.colors.length ? props.colors.slice(0, 4) : ['#20251F', '#353F37'];
  const arr = [...raw];
  if (arr.length >= 3) {
    const mid = Math.floor(arr.length / 2);
    arr.splice(mid, 1);
  }
  return arr;
});

// --- 交互逻辑 ---

const goToLogin = () => router.push('/login');
const renderMarkdown = (text: string) => md.render(text);

/**
 * 智能滚动逻辑：只有在底部或强制滚动时才自动跟随
 */
const scrollToBottom = (force = false) => {
  nextTick(() => {
    const el = msgScrollRef.value;
    if (el) {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (force || isNearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
  });
};

/**
 * 模拟流式打字机效果
 */
const typeEffect = (text: string, messageIndex: number) => {
  let i = 0;
  chatHistory.value[messageIndex].content = '';
  const interval = setInterval(() => {
    if (i < text.length) {
      chatHistory.value[messageIndex].content += text.charAt(i);
      i++;
      scrollToBottom(false); // 非强制跟随
    } else {
      clearInterval(interval);
    }
  }, 30);
};

const handleSendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const query = userInput.value;

  // 【核心修改点 1：打包历史记录】
  // 在把当前用户的新问题展示到界面之前，我们先把之前的对话打包。
  // 只提取发给后端所需的 role 和 content，抛弃 sources 等多余字段。
  const formattedHistory = chatHistory.value.map(msg => ({
    // 【核心修改点 2：角色映射】
    // 你的前端界面用的是 'ai'，但后端的 LangChain 严格认准 'assistant'，所以在这里做一层无缝转换
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.content
  }));

  // 把当前用户的提问 push 到界面上显示
  chatHistory.value.push({ role: 'user', content: query, sources: [] });
  userInput.value = '';
  isLoading.value = true;
  scrollToBottom(true); // 用户发消息时强制滚到底部

  try {
    // 【核心修改点 3：携带书包发送】
    // 将最新的问题 query，和打包好的格式化历史记录 history 一起发给 Axios
    const response = await request.post('/api/v1/chat', {
      query: query,
      history: formattedHistory
    });

    if (response.status === 'success') {
      const aiMsgIndex = chatHistory.value.push({ role: 'ai', content: '', sources: response.data.sources }) - 1;
      typeEffect(response.data.answer, aiMsgIndex);
    }
  } catch (error) {
    chatHistory.value.push({ role: 'ai', content: '抱歉，后端大脑由于 500 错误拒绝了连接，请稍后再试。', sources: [] });
  } finally {
    isLoading.value = false;
  }
};

// --- GSAP 动画基建 (保留原版多图层逻辑) ---

let gsapContext: gsap.Context | null = null;

const initializeGSAP = () => {
  gsapContext = gsap.context(() => {
    const panel = panelRef.value;
    const preContainer = preLayersRef.value;
    const plusH = plusHRef.value;
    const plusV = plusVRef.value;
    const icon = iconRef.value;
    const textInner = textInnerRef.value;

    if (!panel || !plusH || !plusV || !icon || !textInner) return;

    let preLayers = preContainer ? Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[] : [];
    preLayerElsRef.value = preLayers;

    const offscreen = props.position === 'left' ? -100 : 100;
    gsap.set([panel, ...preLayers], { xPercent: offscreen });
    gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
    gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
    gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
    gsap.set(textInner, { yPercent: 0 });

    if (toggleBtnRef.value) gsap.set(toggleBtnRef.value, { color: props.menuButtonColor });
  });
};

const buildOpenTimeline = (): gsap.core.Timeline | null => {
  const panel = panelRef.value;
  const layers = preLayerElsRef.value;
  if (!panel) return null;

  openTlRef.value?.kill();
  if (closeTweenRef.value) {
    closeTweenRef.value.kill();
    closeTweenRef.value = null;
  }

  const layerStates = layers.map((el: HTMLElement) => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
  const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

  if (chatContainerRef.value) gsap.set(chatContainerRef.value, { opacity: 0, y: 30 });

  const tl = gsap.timeline({ paused: true });

  layerStates.forEach((ls, i) => {
    tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
  });

  const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
  const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
  const panelDuration = 0.65;

  tl.fromTo(panel, { xPercent: panelStart }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

  if (chatContainerRef.value) {
    tl.to(chatContainerRef.value, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, panelInsertTime + 0.2);
  }

  openTlRef.value = tl;
  return tl;
};

const toggleMenu = () => {
  const target = !openRef.value;
  openRef.value = target;
  open.value = target;

  if (target) {
    props.onMenuOpen?.();
    if (!busyRef.value) {
      busyRef.value = true;
      const tl = buildOpenTimeline();
      if (tl) {
        tl.eventCallback('onComplete', () => { busyRef.value = false; scrollToBottom(); });
        tl.play(0);
      } else busyRef.value = false;
    }
  } else {
    props.onMenuClose?.();
    openTlRef.value?.kill();
    const all = [...preLayerElsRef.value, panelRef.value!];
    closeTweenRef.value = gsap.to(all, {
      xPercent: props.position === 'left' ? -100 : 100,
      duration: 0.32,
      ease: 'power3.in',
      onComplete: () => { busyRef.value = false; }
    });
  }

  // 按钮与图标动画
  const icon = iconRef.value;
  const h = plusHRef.value;
  const v = plusVRef.value;
  spinTweenRef.value?.kill();
  if (target) {
    gsap.set(icon, { rotate: 0 });
    spinTweenRef.value = gsap.timeline({ defaults: { ease: 'power4.out' } })
      .to(h, { rotate: 45, duration: 0.5 }, 0)
      .to(v, { rotate: -45, duration: 0.5 }, 0);
  } else {
    spinTweenRef.value = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
      .to(h, { rotate: 0, duration: 0.35 }, 0)
      .to(v, { rotate: 90, duration: 0.35 }, 0);
  }

  // 颜色动画
  if (props.changeMenuColorOnOpen && toggleBtnRef.value) {
    colorTweenRef.value?.kill();
    colorTweenRef.value = gsap.to(toggleBtnRef.value, { color: target ? props.openMenuButtonColor : props.menuButtonColor, delay: 0.18, duration: 0.3 });
  }

  // 文字切换动画
  const inner = textInnerRef.value;
  if (inner) {
    textCycleAnimRef.value?.kill();
    const seq = target ? ['Ask me', '...', 'Close'] : ['Close', '...', 'Ask me'];
    textLines.value = seq;
    const finalShift = ((seq.length - 1) / seq.length) * 100;
    textCycleAnimRef.value = gsap.fromTo(inner, { yPercent: 0 }, { yPercent: -finalShift, duration: 0.7, ease: 'power4.out' });
  }
};

onMounted(() => { nextTick(initializeGSAP); });
onBeforeUnmount(() => {
  openTlRef.value?.kill();
  closeTweenRef.value?.kill();
  spinTweenRef.value?.kill();
  textCycleAnimRef.value?.kill();
  colorTweenRef.value?.kill();
  if (gsapContext) gsapContext.revert();
});
</script>

<style scoped>
/* ================= 核心重置与全局定位 ================= */
.sm-scope,
.sm-scope *,
.sm-scope *::before,
.sm-scope *::after {
  box-sizing: border-box;
}

.sm-scope {
  /* 悬浮在全应用最顶层，彻底脱离文档流 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 50;
  /* 只有面板和按钮响应鼠标 */
  pointer-events: none;
}

.sm-scope .staggered-menu-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.sm-scope .staggered-menu-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  /* 按钮靠右 */
  padding: 2.5em;
  background: transparent;
  pointer-events: none;
  z-index: 20;
}

.sm-scope .staggered-menu-header>* {
  pointer-events: auto;
}

/* ================= 菜单按钮样式 ================= */
.sm-scope .sm-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #e9e9ef;
  font-weight: 700;
  line-height: 1;
  overflow: visible;
  font-family: sans-serif;
  font-size: 1.1rem;
}

.sm-scope .sm-toggle-textWrap {
  position: relative;
  margin-right: 0.5em;
  display: inline-block;
  height: 1em;
  overflow: hidden;
  white-space: nowrap;
}

.sm-scope .sm-toggle-textInner {
  display: flex;
  flex-direction: column;
}

.sm-scope .sm-icon {
  position: relative;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sm-scope .sm-icon-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
}

.sm-scope .sm-icon-line-v {
  transform: rotate(90deg);
}

/* ================= 滑动图层与面板 ================= */
.sm-scope .sm-prelayers {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: clamp(320px, 42vw, 500px);
  pointer-events: none;
  z-index: 5;
}

.sm-scope .sm-prelayer {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
}

.sm-scope .staggered-menu-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: clamp(320px, 42vw, 500px);
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  padding: 6em 1.8em 2em 1.8em;
  z-index: 10;
  pointer-events: auto;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
}

.sm-scope .sm-panel-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ================= AI 对话框样式 ================= */
.ai-chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ai-chat-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}

.ai-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111;
  margin: 0;
  letter-spacing: -0.5px;
}

.ai-subtitle {
  font-size: 0.85rem;
  color: #888;
  margin: 0.3rem 0 0 0;
}

.ai-messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ai-messages-wrapper::-webkit-scrollbar {
  width: 4px;
}

.ai-messages-wrapper::-webkit-scrollbar-thumb {
  background: #eee;
  border-radius: 10px;
}

.msg-bubble {
  max-width: 88%;
  padding: 1.1rem;
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.user-msg {
  align-self: flex-end;
  background: #111;
  color: #fff;
  border-bottom-right-radius: 2px;
}

.ai-msg {
  align-self: flex-start;
  background: #f7f7f9;
  color: #222;
  border-bottom-left-radius: 2px;
}

.msg-content :deep(p) {
  margin: 0;
}

.msg-content :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-top: 10px;
}

.msg-sources {
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px dashed #ddd;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.source-tag {
  font-size: 0.75rem;
  background: #fff;
  border: 1px solid var(--sm-accent, #27FF64);
  color: #111;
  padding: 3px 10px;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 600;
}

.source-tag:hover {
  background: var(--sm-accent, #27FF64);
}

.ai-input-area {
  margin-top: 1.5rem;
  position: relative;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f2f2f5;
  border-radius: 30px;
  padding: 0.6rem 1.2rem;
  transition: background 0.3s;
}

.input-wrapper:focus-within {
  background: #ebebee;
}

.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.5rem;
  font-size: 1rem;
  color: #000;
}

.input-wrapper button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #111;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.input-wrapper button:hover {
  color: var(--sm-accent, #27FF64);
  transform: scale(1.1);
}

.auth-btn {
  background: #111;
  color: #fff;
  border: none;
  padding: 0.9rem 2rem;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

/* 打字态动画 */
.dot-typing {
  position: relative;
  left: -9999px;
  width: 7px;
  height: 7px;
  border-radius: 5px;
  background-color: #111;
  color: #111;
  box-shadow: 9984px 0 0 0 #111, 9999px 0 0 0 #111, 10014px 0 0 0 #111;
  animation: dot-typing 1.5s infinite linear;
  margin: 1.2rem 0 0 1.5rem;
}

@keyframes dot-typing {
  0% {
    box-shadow: 9984px 0 0 0 #111, 9999px 0 0 0 #111, 10014px 0 0 0 #111;
  }

  16% {
    box-shadow: 9984px -6px 0 0 #111, 9999px 0 0 0 #111, 10014px 0 0 0 #111;
  }

  33% {
    box-shadow: 9984px 0 0 0 #111, 9999px 0 0 0 #111, 10014px 0 0 0 #111;
  }

  50% {
    box-shadow: 9984px 0 0 0 #111, 9999px -6px 0 0 #111, 10014px 0 0 0 #111;
  }

  66% {
    box-shadow: 9984px 0 0 0 #111, 9999px 0 0 0 #111, 10014px 0 0 0 #111;
  }

  83% {
    box-shadow: 9984px 0 0 0 #111, 9999px 0 0 0 #111, 10014px -6px 0 0 #111;
  }

  100% {
    box-shadow: 9984px 0 0 0 #111, 9999px 0 0 0 #111, 10014px 0 0 0 #111;
  }
}

@media (max-width: 768px) {

  .sm-scope .staggered-menu-panel,
  .sm-scope .sm-prelayers {
    width: 100%;
  }
}
</style>