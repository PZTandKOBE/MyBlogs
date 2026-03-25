import request from '@/utils/request';

/**
 * 上传图片到 COS
 * @param {File} file 原生 File 对象
 */
export const uploadImageApi = (file) => {
  // 处理文件上传必须要用 FormData 构建
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/api/upload',
    method: 'post',
    data: formData
    // 注意：这里去掉了手动设置 Content-Type，让 axios 和浏览器自动处理加上 boundary
  });
};

/**
 * 获取图片列表
 */
export const getImageListApi = () => {
  return request({
    url: '/api/upload/images',
    method: 'get'
  });
};

/**
 * 获取音乐列表
 */
export const getMusicListApi = () => {
  return request({
    url: '/api/music/list',
    method: 'get'
  });
};