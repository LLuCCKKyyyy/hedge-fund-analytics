// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// 获取认证令牌
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 设置认证令牌
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 清除认证令牌
export const clearToken = (): void => {
  localStorage.removeItem('token');
};

// 获取认证头部
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
