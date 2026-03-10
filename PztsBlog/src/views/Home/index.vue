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
  </div>



</template>

<script setup lang="ts">
import Beams from "@/views/background/Beams.vue";
import CardNav from "@/components/common/Card Nav.vue";
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
]
</script>

<style scoped>
.beams-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #000;
}
</style>