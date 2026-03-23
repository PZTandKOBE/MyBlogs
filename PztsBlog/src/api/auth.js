import request from '@/utils/request';

/**
 * 登录接口
 * @param {Object} data { username, password }
 */
export const loginApi = (data) => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  });
};

/**
 * 注册接口
 * @param {Object} data { username, password }
 */
export const registerApi = (data) => {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  });
};