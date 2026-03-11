<template>
  <div class="beams-container">
    <Beams
      :beam-width="2"
      :beam-height="15"
      :beam-number="12"
      :light-color="'#ffffff'"
      :speed="2"
      :noise-intensity="1.75"
      :scale="0.2"
      :rotation="30"
    />
    
    <CardNav
      :logo="logo"
      logoAlt="Company Logo"
      :items="items"
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
    />

    <ul class="ul">
      <li class="li">
        <button class="button"><p class="p">Home</p></button>
      </li>
      
      <li class="li has-submenu">
        <button class="button"><p class="p">Store</p></button>
        
        <div class="submenu-wrapper">
          <div class="submenu-inner">
            <ul class="submenu">
              <li class="sub-li">
                <button class="sub-button"><p class="p">Hardware</p></button>
              </li>
              <li class="sub-li">
                <button class="sub-button"><p class="p">Software</p></button>
              </li>
              <li class="sub-li">
                <button class="sub-button"><p class="p">Accessories</p></button>
              </li>
            </ul>
          </div>
        </div>
      </li>

      <li class="li">
        <button class="button"><p class="p">Settings</p></button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import Beams from "@/views/background/Beams.vue";
import CardNav from "@/components/common/CardNav.vue";
import logo from "@/assets/Blog.svg";

const items = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Company", ariaLabel: "About Company" },
      { label: "Careers", ariaLabel: "About Careers" }
    ]
  },
  {
    label: "Projects",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Featured", ariaLabel: "Featured Projects" },
      { label: "Case Studies", ariaLabel: "Project Case Studies" }
    ]
  },
  {
    label: "Contact",
    bgColor: "#271E37",
    textColor: "#fff",
    links: [
      { label: "Email", ariaLabel: "Email us" },
      { label: "Twitter", ariaLabel: "Twitter" },
      { label: "LinkedIn", ariaLabel: "LinkedIn" }
    ]
  }
];
</script>

<style scoped>
.beams-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
}

/* ================= 主导航栏样式 ================= */
.ul {
  position: absolute;
  left: clamp(1.5rem, 4vw, 5rem); 
  top: max(140px, 30%); 
  transform: translateY(-50%);
  z-index: 50; 
  
  width: fit-content;
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
  font-size: clamp(18px, 2.5vw, 28px); 
  font-weight: 700;
  padding: 0.4em 1.4em 0.4em 0.7em; 
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

/* 主菜单绿色菱形小点 */
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

/* ================= 子集导航栏魔法 ================= */

/* 父级 li 悬浮时触发展开 */
.has-submenu:hover .submenu-wrapper {
  grid-template-rows: 1fr;
}

/* Grid 手风琴核心容器 */
.submenu-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-inner {
  overflow: hidden; /* 必须搭配 hidden 才能实现无缝折叠 */
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem; /* 子菜单项间距更紧凑 */
  padding-left: 2em; /* 向右缩进，形成树状层级感 */
  padding-top: 0.8rem; /* 与父菜单拉开一点呼吸感 */
}

.sub-li {
  margin: 0;
}

.sub-button {
  background-color: transparent;
  font-family: sans-serif;
  color: rgba(255, 255, 255, 0.75); /* 默认偏暗，降低视觉权重 */
  border: none;
  font-size: clamp(14px, 1.8vw, 20px); /* 比主菜单字号小 */
  font-weight: 500; /* 字重变细 */
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

/* 子菜单的绿色小节点（改为细长的科技感短轴） */
.sub-button::before {
  content: "";
  position: absolute;
  width: 4px; 
  height: 0px; /* 初始隐藏 */
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

/* 未 hover 时的静态小绿点（横线） */
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
  opacity: 0; /* Hover 亮起时，静态小横线消失 */
}

@media (max-height: 600px) {
  .ul {
    top: 50%; 
  }
}
</style>