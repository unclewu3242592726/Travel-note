import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define the admin user type
interface AdminUser {
  userId: number;
  username: string;
  email: string;
  userType: number; // Should be 1 for admin
}

// Define the auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = 'http://localhost:8080/api';

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Set up axios interceptors
  useEffect(() => {
    // Request interceptor for adding auth token
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling auth errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear local storage and reset state on auth error
          localStorage.removeItem('admin_accessToken');
          localStorage.removeItem('admin_refreshToken');
          localStorage.removeItem('admin_user');
          setIsAuthenticated(false);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    // Check if the user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_accessToken');
      const userData = localStorage.getItem('admin_user');
      
      if (token && userData) {
        const userObj = JSON.parse(userData);
        
        // Verify that the user is an admin
        if (userObj.userType === 1) {
          setIsAuthenticated(true);
          setUser(userObj);
        } else {
          // If not an admin, clear storage
          localStorage.removeItem('admin_accessToken');
          localStorage.removeItem('admin_refreshToken');
          localStorage.removeItem('admin_user');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      const { accessToken, refreshToken, userId, username: userName, email, userType } = response.data.data;

      if(response.data.code !== 200) {
        throw new Error(response.data.message || '登录失败');
      }
      // Verify that the user is an admin
      if (userType !== 1) {
        throw new Error('非管理员账号，无法登录');
      }

      // Store tokens and user data
      localStorage.setItem('admin_accessToken', accessToken);
      localStorage.setItem('admin_refreshToken', refreshToken);
      localStorage.setItem('admin_user', JSON.stringify({ userId, username: userName, email, userType }));

      setIsAuthenticated(true);
      setUser({ userId, username: userName, email, userType });
    } catch (error: any) {
      if (error.message === '非管理员账号，无法登录') {
        throw error;
      }
      throw new Error(error.response?.data?.message || '登录失败，请重试');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refreshToken');
      
      // Call logout API
      await axios.post(`${API_URL}/auth/logout`, { refreshToken });
      
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('admin_accessToken');
      localStorage.removeItem('admin_refreshToken');
      localStorage.removeItem('admin_user');

      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 