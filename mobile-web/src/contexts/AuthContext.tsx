import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/client';
import { isRelativePath, getFullMediaUrl } from '../utils/media';

// 定义用户类型
interface User {
  userId: number;
  username: string;
  email: string;
  userType: number;
  avatar?: string;
  avatarUrl?: string; // 补全头像 URL 用于展示
}

// 定义 auth 上下文的结构
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string, mobile?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 控制是否正在刷新 access token
let isRefreshing = false;

// 保存因 access token 过期而失败的请求队列
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

// 执行队列请求（刷新成功后重新发送请求或全部 reject）
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 处理头像 URL（如果是相对路径则补全）
  const processUserData = async (userData: User): Promise<User> => {
    if (userData.avatar && isRelativePath(userData.avatar)) {
      try {
        const avatarUrl = await getFullMediaUrl(userData.avatar);
        return { ...userData, avatarUrl };
      } catch (error) {
        console.error('Failed to get avatar URL:', error);
      }
    }
    return { ...userData, avatarUrl: userData.avatar };
  };

  // 重新获取头像 URL（用于更新 UI）
  const refreshUserAvatar = async () => {
    if (user?.avatar) {
      try {
        const updated = await processUserData(user);
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to refresh avatar URL', e);
      }
    }
  };

  // 注销逻辑：清除 token、本地数据
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post('/api/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.warn('Logout request failed, continue cleanup.');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // 设置 axios 请求/响应拦截器（只执行一次）
  useEffect(() => {
    // 请求拦截器：为每个请求附加 access token
    const requestInterceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器：处理 token 过期、刷新 token 的逻辑
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // 检查是否是未认证错误，且还未尝试过刷新
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // 如果正在刷新，则加入队列等待
            return new Promise((resolve, reject) => {
              failedQueue.push({
                resolve: (token: string) => {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                  resolve(axios(originalRequest));
                },
                reject
              });
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const refreshToken = localStorage.getItem('refreshToken');

          if (!refreshToken) {
            await logout();
            return Promise.reject(error);
          }

          try {
            // 尝试刷新 token
            const res = await axios.post('/api/auth/refresh', { refreshToken:refreshToken });
            const newAccessToken = res.data.data.accessToken;

            // 保存新 token 并重新处理请求队列
            localStorage.setItem('accessToken', newAccessToken);
            processQueue(null, newAccessToken);

            // 替换原请求 token 并重试
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (err) {
            processQueue(err, null);
            await logout(); // 刷新失败，强制登出
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error); // 其他错误正常抛出
      }
    );

    // 组件卸载时移除拦截器
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // 初始加载：检查本地 token 和用户信息
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const parsed = JSON.parse(userData);
        const processedUser = await processUserData(parsed);
        setIsAuthenticated(true);
        setUser(processedUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // 登录逻辑：调用接口，保存 token 和用户信息
  const login = async (username: string, password: string): Promise<void> => {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      
      // 检查响应状态
      if (res.data.code !== 200 || !res.data.data) {
        throw new Error(res.data.message || '登录失败');
      }
      
      const { accessToken, refreshToken, userId, username: name, email, userType, avatar } = res.data.data;
      
      // 验证必要的字段是否存在
      if (!accessToken || !refreshToken || !userId) {
        throw new Error('服务器响应数据不完整');
      }

      const userData: User = { userId, username: name, email, userType, avatar };
      const processed = await processUserData(userData);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(processed));

      setIsAuthenticated(true);
      setUser(processed);
      
      // 不返回任何值，符合Promise<void>类型
    } catch (error: any) {
      console.error('登录失败:', error);
      // 清除可能存在的无效数据
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // 抛出更有用的错误信息，供UI层处理
      throw new Error(error.response?.data?.message || error.message || '登录失败，请检查网络连接');
    }
  };

  // 注册逻辑：注册后自动登录
  const register = async (username: string, password: string, email: string, mobile?: string) => {
    const res = await axios.post('/api/auth/register', { username, password, email, mobile });

    if (res.data.code !== 200 || !res.data.data) {
      throw new Error(res.data.message || '注册失败');
    }

    const { accessToken, refreshToken, userId, username: name, email: userEmail, userType, avatar } = res.data.data;
    const userData: User = { userId, username: name, email: userEmail, userType, avatar };
    const processed = await processUserData(userData);

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(processed));

    setIsAuthenticated(true);
    setUser(processed);
  };

  // 提供上下文值
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout, refreshUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义 Hook 用于访问 AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};