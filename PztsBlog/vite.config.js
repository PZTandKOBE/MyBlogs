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
      // 将所有以 /api 开头的请求代理到后端服务器
      '/api': {
        target: 'http://121.37.230.81:8081', // TODO: 请替换为你的真实后端本地运行地址
        changeOrigin: true,
        // 如果后端接口本身就带有 /api，则不需要重写路径
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})