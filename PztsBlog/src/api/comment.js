import request from '@/utils/request';

/**
 * 发布评论
 * @param {Object} data { articleId, content, imageUrl }
 */
export const publishCommentApi = (data) => {
  return request({
    url: '/api/comments',
    method: 'post',
    data
  });
};

/**
 * 获取评论列表
 * @param {Number|String} articleId 文章ID
 */
export const getCommentListApi = (articleId) => {
  return request({
    url: `/api/comments/article/${articleId}`,
    method: 'get'
  });
};

/**
 * 删除评论
 * @param {Number|String} id 评论ID
 */
export const deleteCommentApi = (id) => {
  return request({
    url: `/api/comments/${id}`,
    method: 'delete'
  });
};