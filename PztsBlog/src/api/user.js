import request from '@/utils/request';

/**
 * 获取当前登录用户信息
 * 需要在请求头中携带 Authorization Token
 */
export const getCurrentUserApi = () => {
  return request({
    url: '/api/users/current',
    method: 'get'
  });
};

/**
 * 根据 ID 获取用户信息
 * @param {Number|String} id 用户ID
 */
export const getUserByIdApi = (id) => {
  return request({
    url: `/api/users/${id}`,
    method: 'get'
  });
};