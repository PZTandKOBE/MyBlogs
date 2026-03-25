<script setup lang="ts">
import { gsap } from 'gsap';
import { nextTick, onBeforeUpdate, onMounted, onUnmounted, ref, watch, type VNodeRef } from 'vue';
import { useRouter } from 'vue-router';

// 修改了类型支持：支持 href(路由跳转) 或 action(执行函数，如分类过滤)
type CardNavLink = {
  label: string;
  href?: string;
  action?: () => void;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo?: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

const props = withDefaults(defineProps<CardNavProps>(), {
  logoAlt: 'Logo',
  className: '',
  ease: 'power3.out',
  baseColor: '#fff'
});

const emit = defineEmits(['search']);
const router = useRouter();

// 搜索关键词状态
const searchQuery = ref('');

const goToPublish = () => {
  router.push('/publish');
};

// 触发搜索事件
const emitSearch = () => {
  emit('search', searchQuery.value.trim());
};

// 统一下拉菜单的点击事件：支持跳转路由或执行函数
const handleLinkClick = (lnk: CardNavLink) => {
  if (lnk.action) {
    lnk.action();
  } else if (lnk.href) {
    if (lnk.href.startsWith('http')) {
      window.open(lnk.href, '_blank');
    } else {
      router.push(lnk.href);
    }
  }
  // 点击后自动收起菜单
  if (isExpanded.value) toggleMenu();
};

const isHamburgerOpen = ref(false);
const isExpanded = ref(false);
const navRef = ref<HTMLDivElement | null>(null);
const cardsRef = ref<HTMLDivElement[]>([]);
const tlRef = ref<gsap.core.Timeline | null>(null);

const setCardRef = (i: number): VNodeRef => el => {
  if (el && el instanceof HTMLDivElement) {
    cardsRef.value[i] = el;
  }
};

onBeforeUpdate(() => {
  cardsRef.value = [];
});

const calculateHeight = () => {
  const navEl = navRef.value;
  if (!navEl) return 260;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
    if (contentEl) {
      const wasVisible = contentEl.style.visibility;
      const wasPosition = contentEl.style.position;
      const wasHeight = contentEl.style.height;

      contentEl.style.visibility = 'visible';
      contentEl.style.position = 'static';
      contentEl.style.height = 'auto';

      const topBar = 60;
      const padding = 16;
      const contentHeight = contentEl.scrollHeight;

      contentEl.style.visibility = wasVisible;
      contentEl.style.position = wasPosition;
      contentEl.style.height = wasHeight;

      return topBar + contentHeight + padding;
    }
  }
  return 260;
};

const createTimeline = () => {
  const navEl = navRef.value;
  if (!navEl) return null;

  gsap.set(navEl, { height: 60 });
  gsap.set(cardsRef.value, { y: 50, opacity: 0 });

  const tl = gsap.timeline({ paused: true });
  tl.to(navEl, { height: calculateHeight, duration: 0.4, ease: props.ease });
  tl.to(cardsRef.value, { y: 0, opacity: 1, duration: 0.4, ease: props.ease, stagger: 0.08 }, '-=0.1');

  return tl;
};

const toggleMenu = () => {
  const tl = tlRef.value;
  if (!tl) return;
  if (!isExpanded.value) {
    isHamburgerOpen.value = true;
    isExpanded.value = true;
    nextTick(() => { tl.play(0); });
  } else {
    isHamburgerOpen.value = false;
    tl.eventCallback('onReverseComplete', () => {
      isExpanded.value = false;
      tl.eventCallback('onReverseComplete', null);
    });
    tl.reverse();
  }
};

const handleResize = () => {
  if (!tlRef.value) return;
  if (isExpanded.value) {
    const newHeight = calculateHeight();
    gsap.set(navRef.value, { height: newHeight });
    tlRef.value.kill();
    const newTl = createTimeline();
    if (newTl) {
      newTl.progress(1);
      tlRef.value = newTl;
    }
  } else {
    tlRef.value.kill();
    tlRef.value = createTimeline();
  }
};

onMounted(() => {
  tlRef.value = createTimeline();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  tlRef.value?.kill();
  tlRef.value = null;
  window.removeEventListener('resize', handleResize);
});

watch(() => [props.ease, props.items], () => {
  nextTick(() => {
    if (tlRef.value) tlRef.value.kill();
    tlRef.value = createTimeline();
  });
});
</script>

<template>
  <div :class="`card-nav-container ${props.className}`">
    <nav ref="navRef" :class="['card-nav', { open: isExpanded }]" :style="{ backgroundColor: props.baseColor }">
      <div class="card-nav-top">
        <div class="hamburger-menu" :class="{ open: isHamburgerOpen }" @click="toggleMenu" role="button">
          <div class="hamburger-line line-1" />
          <div class="hamburger-line line-2" />
        </div>

        <div class="logo-container">
          <div id="poda">
            <div class="glow"></div>
            <div class="darkBorderBg"></div>
            <div class="darkBorderBg"></div>
            <div class="darkBorderBg"></div>
            <div class="white"></div>
            <div class="border"></div>

            <div id="main">
              <input 
                v-model="searchQuery" 
                @keyup.enter="emitSearch"
                placeholder="搜索文章并回车..." 
                type="text" 
                class="input" 
              />
              <div id="input-mask"></div>
              <div id="pink-mask"></div>
              <div class="filterBorder"></div>
              <div id="search-icon" @click="emitSearch" style="cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" height="24" fill="none" class="feather feather-search">
                  <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                  <line stroke="url(#searchl)" y2="16.65" y1="22" x2="16.65" x1="22"></line>
                  <defs>
                    <linearGradient gradientTransform="rotate(50)" id="search">
                      <stop stop-color="#f8e7f8" offset="0%"></stop>
                      <stop stop-color="#b6a9b7" offset="50%"></stop>
                    </linearGradient>
                    <linearGradient id="searchl">
                      <stop stop-color="#b6a9b7" offset="0%"></stop>
                      <stop stop-color="#837484" offset="50%"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <button type="button" class="card-nav-cta-button" @click="goToPublish" :style="{ backgroundColor: props.buttonBgColor, color: props.buttonTextColor }">
          <h2>+</h2>
        </button>
      </div>

      <div :class="['card-nav-content', isExpanded ? 'visible' : 'invisible']" :aria-hidden="!isExpanded">
        <div v-for="(item, idx) in (props.items || []).slice(0, 3)" :key="`${item.label}-${idx}`" :ref="setCardRef(idx)" class="nav-card" :style="{ backgroundColor: item.bgColor, color: item.textColor }">
          <div class="nav-card-label">{{ item.label }}</div>
          <div class="nav-card-links">
            <a v-for="(lnk, i) in item.links" :key="`${lnk.label}-${i}`" class="nav-card-link" @click.prevent="handleLinkClick(lnk)">
              <svg class="nav-card-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              {{ lnk.label }}
            </a>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.card-nav-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  z-index: 99;
  top: 2em;
}

.card-nav {
  display: block;
  height: 60px;
  padding: 0;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
  will-change: height;
  box-sizing: border-box;
}

.card-nav-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.1rem;
  height: 60px;
  box-sizing: border-box;
}

.hamburger-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: 6px;
  height: 100%;
}

.hamburger-line {
  width: 30px;
  height: 2px;
  background-color: currentColor;
  transition: transform 0.3s linear, opacity 0.3s linear, margin 0.3s linear;
  transform-origin: 50% 50%;
}

.hamburger-menu.open .line-1 {
  transform: translateY(4px) rotate(45deg);
}

.hamburger-menu.open .line-2 {
  transform: translateY(-4px) rotate(-45deg);
}

.logo-container {
  display: flex;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.card-nav-cta-button {
  display: inline-flex;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.55rem;
  height: 40px;
  align-items: center;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.card-nav-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  bottom: 0;
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 12px;
  z-index: 1;
  visibility: hidden;
  pointer-events: none;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 0 0 0.75rem 0.75rem;
}

.card-nav-content.visible {
  visibility: visible;
  pointer-events: auto;
}

.nav-card {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  gap: 0.5rem;
  padding: 12px 16px;
  border-radius: 0.55rem;
  height: 100%;
  user-select: none;
  box-sizing: border-box;
}

.nav-card-label {
  font-weight: 400;
  font-size: 22px;
  letter-spacing: -0.5px;
}

.nav-card-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: auto;
}

.nav-card-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  color: inherit;
  opacity: 1;
  transition: opacity 0.3s;
}

.nav-card-link:hover {
  opacity: 0.75;
}

.nav-card-link-icon {
  flex-shrink: 0;
}

#poda {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 354px;
  height: 130px;
  transform: scale(0.75);
  transform-origin: center center;
  z-index: 1;
}

.white,
.border,
.darkBorderBg,
.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  width: 100%;
  overflow: hidden;
  z-index: -1;
  border-radius: 12px;
  filter: blur(3px);
  max-height: 70px;
  max-width: 314px;
}

.input {
  background-color: #010201;
  border: none;
  width: 301px;
  height: 56px;
  border-radius: 10px;
  color: white;
  padding-inline: 59px;
  font-size: 18px;
}

.input::placeholder {
  color: #c0b9c0;
}

.input:focus {
  outline: none;
}

#main {
  position: relative;
  display: flex;
}

#main:focus-within>#input-mask {
  display: none;
}

#input-mask {
  pointer-events: none;
  width: 100px;
  height: 20px;
  position: absolute;
  background: linear-gradient(90deg, transparent, black);
  top: 18px;
  left: 70px;
}

#pink-mask {
  pointer-events: none;
  width: 30px;
  height: 20px;
  position: absolute;
  background: #cf30aa;
  top: 10px;
  left: 5px;
  filter: blur(20px);
  opacity: 0.8;
  transition: all 2s;
}

#main:hover>#pink-mask {
  opacity: 0;
}

.white {
  max-height: 63px;
  max-width: 307px;
  border-radius: 10px;
  filter: blur(2px);
}

.white::before {
  content: "";
  z-index: -2;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(83deg);
  position: absolute;
  width: 600px;
  height: 600px;
  background-repeat: no-repeat;
  background-position: 0 0;
  filter: brightness(1.4);
  background-image: conic-gradient(rgba(0, 0, 0, 0) 0%, #a099d8, rgba(0, 0, 0, 0) 8%, rgba(0, 0, 0, 0) 50%, #dfa2da, rgba(0, 0, 0, 0) 58%);
  transition: all 2s;
}

.border {
  max-height: 59px;
  max-width: 303px;
  border-radius: 11px;
  filter: blur(0.5px);
}

.border::before {
  content: "";
  z-index: -2;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(70deg);
  position: absolute;
  width: 600px;
  height: 600px;
  filter: brightness(1.3);
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: conic-gradient(#1c191c, #402fb5 5%, #1c191c 14%, #1c191c 50%, #cf30aa 60%, #1c191c 64%);
  transition: all 2s;
}

.darkBorderBg {
  max-height: 65px;
  max-width: 312px;
}

.darkBorderBg::before {
  content: "";
  z-index: -2;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(82deg);
  position: absolute;
  width: 600px;
  height: 600px;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: conic-gradient(rgba(0, 0, 0, 0), #18116a, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0) 50%, #6e1b60, rgba(0, 0, 0, 0) 60%);
  transition: all 2s;
}

#poda:hover>.darkBorderBg::before {
  transform: translate(-50%, -50%) rotate(262deg);
}

#poda:hover>.glow::before {
  transform: translate(-50%, -50%) rotate(240deg);
}

#poda:hover>.white::before {
  transform: translate(-50%, -50%) rotate(263deg);
}

#poda:hover>.border::before {
  transform: translate(-50%, -50%) rotate(250deg);
}

#poda:focus-within>.darkBorderBg::before {
  transform: translate(-50%, -50%) rotate(442deg);
  transition: all 4s;
}

#poda:focus-within>.glow::before {
  transform: translate(-50%, -50%) rotate(420deg);
  transition: all 4s;
}

#poda:focus-within>.white::before {
  transform: translate(-50%, -50%) rotate(443deg);
  transition: all 4s;
}

#poda:focus-within>.border::before {
  transform: translate(-50%, -50%) rotate(430deg);
  transition: all 4s;
}

.glow {
  overflow: hidden;
  filter: blur(30px);
  opacity: 0.4;
  max-height: 130px;
  max-width: 354px;
}

.glow:before {
  content: "";
  z-index: -2;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(60deg);
  position: absolute;
  width: 999px;
  height: 999px;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-image: conic-gradient(#000, #402fb5 5%, #000 38%, #000 50%, #cf30aa 60%, #000 87%);
  transition: all 2s;
}

@keyframes rotate {
  100% {
    transform: translate(-50%, -50%) rotate(450deg);
  }
}

#filter-icon {
  display: none;
}

#search-icon {
  position: absolute;
  left: 20px;
  top: 15px;
}

@media (max-width: 768px) {
  .logo-container {
    position: static;
    transform: none;
  }

  .card-nav-cta-button {
    display: none;
  }

  .card-nav-content {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-card {
    flex: 1 1 auto;
    height: auto;
    min-height: 60px;
  }

  #poda {
    transform: scale(0.55);
  }
}
</style>