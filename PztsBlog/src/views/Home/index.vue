<template>
  <div class="beams-container">
    <Beams
      class="background-beams"
      :beam-width="2"
      :beam-height="15"
      :beam-number="12"
      :light-color="'#ffffff'"
      :speed="2"
      :noise-intensity="1.75"
      :scale="0.2"
      :rotation="30"
    />
    
    <div class="scrollable-content">
      <div class="sticky-nav-wrapper">
        <div class="user-btn-container">
          <button class="Btn" @click="checkLoginAndGo" title="个人设置">
            <span class="svgContainer">
              <svg fill="white" viewBox="0 0 448 512" height="1.6em">
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
              </svg>
            </span>
            <span class="BG"></span>
          </button>
        </div>

        <CardNav
          :logo="logo"
          logoAlt="Company Logo"
          :items="navItems"
          @search="handleSearch"
          baseColor="#fff"
          menuColor="#000"
          buttonBgColor="#111"
          buttonTextColor="#fff"
          ease="power3.out"
        />

        <div class="login-btn-container">
          <button v-if="!isLoggedIn" class="login-btn" @click="goToLogin">
            登 录
          </button>
          <button v-else class="login-btn logout-btn" @click="handleLogout">
            退出账号
          </button>
        </div>
      </div>

      <div class="main-layout">
        <div class="left-nav-container">
          <ul class="ul">
            <li class="li"><button class="button" @click="goToPublish"><p class="p">工作台</p></button></li>
            <li class="li has-submenu">
              <button class="button" @click="filterByCategory(null)"><p class="p">文章类型</p></button>
              <div class="submenu-wrapper">
                <div class="submenu-inner">
                  <ul class="submenu">
                    <li class="sub-li"><button class="sub-button" :class="{ active: selectedCategoryId === null }" @click="filterByCategory(null)"><p class="p">全部文章</p></button></li>
                    <li class="sub-li"><button class="sub-button" :class="{ active: selectedCategoryId === 3 }" @click="filterByCategory(3)"><p class="p">技术</p></button></li>
                    <li class="sub-li"><button class="sub-button" :class="{ active: selectedCategoryId === 2 }" @click="filterByCategory(2)"><p class="p">游戏</p></button></li>
                    <li class="sub-li"><button class="sub-button" :class="{ active: selectedCategoryId === 1 }" @click="filterByCategory(1)"><p class="p">生活</p></button></li>
                  </ul>
                </div>
              </div>
            </li>
            <li class="li"><button class="button" @click="goToAuthorInfo"><p class="p">作者信息</p></button></li>
          </ul>
        </div>

        <div class="middle-content-container">
          <div class="list-wrapper">
            <ListCard :categoryId="selectedCategoryId" :keyword="searchKeyword" />
          </div>
          <div class="gallery-wrapper">
            <h2 class="gallery-title">My travel photos</h2>
            <RollingGallery :autoplay="true" :pause-on-hover="true" />
          </div>
        </div>

        <div class="right-placeholder">
          <musicCard />
        </div>
      </div>
    </div>

    <AlertModal v-model:visible="alertVisible" :type="alertType" :title="alertTitle" :message="alertMessage" @confirm="handleAlertConfirm" @cancel="handleAlertCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; 
import Beams from "@/views/background/Beams.vue";
import CardNav from "@/components/common/CardNav.vue";
import ListCard from "@/components/common/ListCard.vue"; 
import logo from "@/assets/Blog.svg";
import musicCard from "@/components/common/musicCard.vue";
import RollingGallery from "@/components/common/RollingGallery.vue"; 
import AlertModal from '@/views/Error/index.vue';

const router = useRouter();

const isLoggedIn = ref(false);
const selectedCategoryId = ref<number | null>(null);
const searchKeyword = ref('');

const alertVisible = ref(false);
const alertType = ref<'success' | 'error' | 'confirm'>('error');
const alertTitle = ref('提示');
const alertMessage = ref('');
const pendingRedirect = ref(false);
const pendingAction = ref<'logout' | null>(null);

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('token');
});

// 处理搜索回车事件
const handleSearch = (kw: string) => {
  searchKeyword.value = kw;
};

const filterByCategory = (id: number | null) => {
  selectedCategoryId.value = id;
};

// ================= 重构：专属你的下拉菜单配置 =================
const navItems = computed(() => [
  {
    label: "创作管理",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "写新文章", ariaLabel: "Publish", href: "/publish" },
      { label: "个人资料设置", ariaLabel: "User Settings", href: "/userInfo" }
    ]
  },
  {
    label: "文章发现",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "查看全部", ariaLabel: "All", action: () => filterByCategory(null) },
      { label: "技术前沿", ariaLabel: "Tech", action: () => filterByCategory(3) },
      { label: "游戏世界", ariaLabel: "Game", action: () => filterByCategory(2) },
      { label: "生活随笔", ariaLabel: "Life", action: () => filterByCategory(1) }
    ]
  },
  {
    label: "关于博客",
    bgColor: "#271E37",
    textColor: "#fff",
    links: [
      { label: "作者信息", ariaLabel: "Author Info", href: "/user" }
    ]
  }
]);

const showAlert = ({ type = 'error', title = '提示', message }: any) => {
  alertType.value = type; alertTitle.value = title; alertMessage.value = message; alertVisible.value = true;
};

const handleAlertConfirm = () => {
  if (pendingAction.value === 'logout') {
    localStorage.removeItem('token');
    isLoggedIn.value = false;
    pendingAction.value = null;
  } else if (pendingRedirect.value) {
    pendingRedirect.value = false;
    router.push('/login');
  }
};

const handleAlertCancel = () => {
  pendingAction.value = null;
  pendingRedirect.value = false;
};

const handleLogout = () => {
  pendingAction.value = 'logout';
  showAlert({ type: 'confirm', title: '退出登录', message: '确定要退出当前账号吗？' });
};

const checkLoginAndGo = () => {
  const token = localStorage.getItem('token'); 
  if (token) { router.push('/userInfo'); } 
  else { pendingRedirect.value = true; showAlert({ type: 'error', title: '未登录', message: '检测到您尚未登录，请先登录！' }); }
};

const goToLogin = () => router.push('/login');
const goToPublish = () => router.push('/publish');
const goToAuthorInfo = () => router.push('/user');
</script>

<style scoped>
.beams-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
}

.background-beams {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.scrollable-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;
  scroll-behavior: smooth;
}

.scrollable-content::-webkit-scrollbar {
  display: none;
}

.sticky-nav-wrapper {
  position: sticky;
  top: 0;
  width: 100%;
  height: 120px;
  z-index: 100;
  pointer-events: none;
}

.sticky-nav-wrapper :deep(.card-nav-container) {
  pointer-events: auto;
}

.user-btn-container {
  position: absolute;
  left: 2.5%;
  top: 40px;
  pointer-events: auto;
  z-index: 110;
}

.Btn {
  width: 55px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  position: relative;
  border-radius: 7px;
  cursor: pointer;
  transition: all .3s;
}

.svgContainer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  backdrop-filter: blur(0px);
  letter-spacing: 0.8px;
  border-radius: 10px;
  transition: all .3s;
  border: 1px solid rgba(156, 156, 156, 0.466);
}

.BG {
  position: absolute;
  content: "";
  width: 100%;
  height: 100%;
  background: #181818;
  z-index: -1;
  border-radius: 10px;
  pointer-events: none;
  transition: all .3s;
}

.Btn:hover .BG {
  transform: rotate(35deg);
  transform-origin: bottom;
}

.Btn:hover .svgContainer {
  background-color: rgba(156, 156, 156, 0.466);
  backdrop-filter: blur(4px);
}

.login-btn-container {
  position: absolute;
  right: 2.5%;
  top: 40px;
  pointer-events: auto;
  z-index: 110;
}

.login-btn {
  padding: 0.55rem 1.6rem;
  font-size: 1rem;
  font-family: sans-serif;
  font-weight: 600;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.login-btn:active {
  transform: translateY(0);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.6);
}

.main-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  width: 95%;
  max-width: 1380px;
  margin: 10px auto 10vh auto;
  z-index: 40;
}

.left-nav-container {
  width: 350px;
  flex-shrink: 0;
  padding-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.middle-content-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.list-wrapper {
  width: 100%;
  height: 900px;
}

.gallery-wrapper {
  width: 100%;
}

.right-placeholder {
  width: 350px;
  flex-shrink: 0;
}

@media (max-width: 1300px) {

  .left-nav-container,
  .right-placeholder {
    display: none;
  }
}

.ul {
  width: 160px;
  height: fit-content;
  background-color: transparent;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 3vh, 1.5rem);
}

.li {
  margin: 0px;
}

.button {
  background-color: transparent;
  font-family: sans-serif;
  color: rgb(255, 255, 255);
  border: none;
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 700;
  padding: 0.4em 0.5em 0.4em 0.7em;
  cursor: pointer;
  position: relative;
  text-align: left;
  transition: color 0.2s ease;
  z-index: 1;
  width: 100%;
}

.p {
  z-index: 2;
  position: relative;
  margin: 0;
}

.button:hover {
  color: #000000;
}

.button:hover::before {
  transform: rotate(0deg);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 8px;
  background-color: #ffffff;
}

.button::before {
  content: "";
  border-radius: 2px;
  position: absolute;
  width: 0.35em;
  height: 0.35em;
  background-color: #ffffff;
  left: -0.35em;
  top: 50%;
  transform: translateY(-50%) rotate(225deg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.button:active::before {
  background-color: #2c2b2b;
}

.has-submenu:hover .submenu-wrapper {
  grid-template-rows: 1fr;
}

.submenu-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-inner {
  overflow: hidden;
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-left: 2em;
  padding-top: 0.8rem;
}

.sub-li {
  margin: 0;
}

.sub-button {
  background-color: transparent;
  font-family: sans-serif;
  color: rgba(255, 255, 255, 0.75);
  border: none;
  font-size: clamp(14px, 1.8vw, 18px);
  font-weight: 500;
  padding: 0.3em 1em 0.3em 0.5em;
  cursor: pointer;
  position: relative;
  text-align: left;
  transition: color 0.2s ease;
  z-index: 1;
  width: 100%;
}

.sub-button:hover {
  color: #000000;
}

.sub-button:hover::before {
  transform: rotate(0deg);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 6px;
  background-color: #ffffff;
}

.sub-button::before {
  content: "";
  position: absolute;
  width: 4px;
  height: 0px;
  background-color: #ffffff;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.sub-button:hover::before {
  width: 100%;
  height: 100%;
  left: 0;
}

.sub-button::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 2px;
  background-color: #ffffff;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
  transition: opacity 0.2s;
}

.sub-button:hover::after {
  opacity: 0;
}

.sub-button.active {
  color: #000000;
}

.sub-button.active::before {
  width: 100%;
  height: 100%;
  left: 0;
  border-radius: 6px;
  background-color: #ffffff;
}

.sub-button.active::after {
  opacity: 0;
}

.gallery-title {
  color: #ffffff;
  font-size: 50px;
  font-weight: 700;
  font-family: sans-serif;
  margin-bottom: 20px;
  text-align: center;
  margin-top: 0;
  padding-left: 10px;
  letter-spacing: 2px;
}
</style>