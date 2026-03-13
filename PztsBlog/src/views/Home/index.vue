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
      </div>

      <div class="main-layout">
        
        <div class="left-nav-container">
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

        <div class="middle-content-container">
          <div class="list-wrapper">
            <ListCard />
          </div>

          <div class="gallery-wrapper">
            <h2 class="gallery-title">My travel photos</h2>

            <RollingGallery
              :autoplay="true"
              :pause-on-hover="true"
              :images="customImages"
            />
          </div>
        </div>

        <div class="right-placeholder">
          <musicCard />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Beams from "@/views/background/Beams.vue";
import CardNav from "@/components/common/CardNav.vue";
import ListCard from "@/components/common/ListCard.vue"; 
import logo from "@/assets/Blog.svg";
import musicCard from "@/components/common/musicCard.vue";
import RollingGallery from "@/components/common/RollingGallery.vue"; 

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

const customImages = [
  "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1495103033382-fe343886b671?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1506781961370-37a89d6b3095?q=80&w=3264&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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

.background-beams {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  pointer-events: none; 
}

.scrollable-content {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
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
  /* ★ 这里从 600px 修改到了 750px，让文章列表变得更长 */
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
  .left-nav-container, .right-placeholder {
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