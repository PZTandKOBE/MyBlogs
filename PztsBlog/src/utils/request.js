import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
  // baseURL 留空即可，因为配置了 vite 代理，我们会直接请求 /api/...
  baseURL: '', 
  timeout: 10000 // 请求超时时间
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 中获取 token
    const token = localStorage.getItem('token');
    if (token) {
      // 将 token 添加到请求头，通常配合 Bearer 使用，具体可按后端要求调整
      config.headers['Authorization'] = `Bearer ${token}`; 
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 根据后端的返回结构，直接提取 data 数据部分
    return response.data;
  },
  error => {
    // 这里可以统一处理错误，例如弹窗提示等
    console.error('请求出错:', error);
    return Promise.reject(error);
  }
);

export default request;