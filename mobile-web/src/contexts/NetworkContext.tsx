import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/client';
import { AxiosError } from 'axios';
import { Snackbar, Alert } from '@mui/material';

// 定义网络状态上下文类型
interface NetworkContextType {
  isOnline: boolean;
  lastNetworkError: string | null;
  clearNetworkError: () => void;
}

// 创建网络状态上下文
const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

// 网络状态提供者组件属性类型
interface NetworkProviderProps {
  children: React.ReactNode;
}

// 网络状态提供者组件
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastNetworkError, setLastNetworkError] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  // 清除网络错误
  const clearNetworkError = () => {
    setLastNetworkError(null);
    setShowSnackbar(false);
  };

  // 监听浏览器的在线/离线状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastNetworkError(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastNetworkError('网络连接已断开，请检查您的网络设置');
      setShowSnackbar(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 设置axios拦截器以处理网络错误
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // 如果没有响应对象，则认为是网络错误
        const axiosError = error as AxiosError;
        if (!axiosError.response) {
          setLastNetworkError('无法连接到服务器，请检查您的网络连接');
          setShowSnackbar(true);
        }
        return Promise.reject(error);
      }
    );

    // 定期检查服务器是否可达
    const pingServer = async () => {
      try {
        await axios.head('/api/ping', { timeout: 5000 });
      } catch (error) {
        // 仅当浏览器显示为在线但无法访问服务器时，才显示网络错误
        // 添加类型检查以解决TS18046错误
        const axiosError = error as AxiosError;
        if (navigator.onLine && !axiosError.response) {
          setLastNetworkError('无法访问服务器，网络连接不稳定');
          setShowSnackbar(true);
        }
      }
    };

    // 每60秒检查一次服务器连接
    pingServer(); 
    const pingInterval = setInterval(pingServer, 60000);

    // 组件卸载时清理事件监听和定时器
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      axios.interceptors.response.eject(responseInterceptor);
      clearInterval(pingInterval);
    };
  }, []);

  // 处理Snackbar关闭事件
  const handleSnackbarClose = () => {
    clearNetworkError();
    setShowSnackbar(false);
  };

  return (
    <NetworkContext.Provider value={{ isOnline, lastNetworkError, clearNetworkError }}>
      {children}
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {lastNetworkError}
        </Alert>
      </Snackbar>
    </NetworkContext.Provider>
  );
};

// 自定义Hook，用于使用网络状态上下文
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};