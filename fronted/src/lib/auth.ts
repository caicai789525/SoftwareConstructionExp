import type { User } from '../types';

// 认证管理
export const auth = {
  // 保存 token
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  // 获取 token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // 删除 token
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // 保存用户信息
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // 获取用户信息
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 删除用户信息
  removeUser: () => {
    localStorage.removeItem('user');
  },

  // 登出
  logout: () => {
    auth.removeToken();
    auth.removeUser();
  },

  // 检查是否已登录
  isAuthenticated: () => {
    return !!auth.getToken();
  },
};
