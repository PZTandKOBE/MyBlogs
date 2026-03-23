import request from '@/utils/request';

/**
 * 发布文章
 * @param {Object} data { title, content, coverImage, status, categoryId }
 */
export const publishArticleApi = (data) => {
  return request({
    url: '/api/articles',
    method: 'post',
    data
  });
};

/**
 * 修改文章
 * @param {Object} data { id, title, content, coverImage, status, categoryId }
 */
export const updateArticleApi = (data) => {
  return request({
    url: '/api/articles',
    method: 'put',
    data
  });
};

/**
 * 获取文章列表
 * @param {Object} params { pageNum, pageSize, categoryId }
 */
export const getArticleListApi = (params) => {
  return request({
    url: '/api/articles/list',
    method: 'get',
    params
  });
};

/**
 * 获取单篇文章详情
 * @param {Number|String} id 文章ID
 */
export const getArticleDetailApi = (id) => {
  return request({
    url: `/api/articles/${id}`,
    method: 'get'
  });
};

/**
 * 删除文章
 * @param {Number|String} id 文章ID
 */
export const deleteArticleApi = (id) => {
  return request({
    url: `/api/articles/${id}`,
    method: 'delete'
  });
};