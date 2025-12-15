import type { User } from '../types';

// 认证管理
export const auth = {
  // 保存 token
  setToken: (token: string) => {
    sessionStorage.setItem("token", token);
  },
  getToken: () => {
    return sessionStorage.getItem("token");
  },
  removeToken: () => {
    sessionStorage.removeItem("token");
  },
  setUser: (user: User) => {
    sessionStorage.setItem("user", JSON.stringify(user));
  },
  getUser: (): User | null => {
    const userStr = sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
  removeUser: () => {
    sessionStorage.removeItem("user");
  },
  logout: () => {
    auth.removeToken();
    auth.removeUser();
  },
  isAuthenticated: () => {
    return !!auth.getToken();
  },

  // 检查是否已登录

};
