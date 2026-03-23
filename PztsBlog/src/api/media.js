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
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
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