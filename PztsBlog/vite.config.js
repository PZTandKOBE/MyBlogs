import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 1. 【精准拦截】只将前端发出的 AI 对话请求打给 Python 大脑
      '/api/v1/chat': {
        target: 'http://121.37.230.81:9090',
        changeOrigin: true,
      },

      // 2. 【全局兜底】前端其余所有的业务请求（登录、文章、用户等），全部打给 Spring Boot
      '/api': {
        target: 'http://121.37.230.81:8081',
        changeOrigin: true,
      }
    }
  }
})