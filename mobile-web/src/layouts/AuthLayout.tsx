import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Container, Paper, Box, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AuthLayout.css';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const [prevPathname, setPrevPathname] = useState<string>(location.pathname);

  // 通过路径判断当前页面是登录还是注册
  const isLoginPath = location.pathname.includes('login');
  const isRegisterPath = location.pathname.includes('register');

  // 确保初始动画状态正确
  useEffect(() => {
    // 重置卡片状态为初始状态
    const flipContainer = document.querySelector('.flip-container');
    if (flipContainer) {
      if (isRegisterPath) {
        flipContainer.classList.add('show-register');
      } else {
        flipContainer.classList.remove('show-register');
      }
    }
  }, []);

  // 当路径变化时触发翻转
  useEffect(() => {
    // 跳过首次加载
    if (prevPathname === location.pathname) {
      return;
    }

    const flipContainer = document.querySelector('.flip-container');
    if (flipContainer) {
      // 添加过渡类
      flipContainer.classList.add('flipping');
      
      // 如果前往注册页，添加展示注册类
      if (isRegisterPath) {
        flipContainer.classList.add('show-register');
      } else {
        flipContainer.classList.remove('show-register');
      }
      
      // 动画完成后移除过渡类
      setTimeout(() => {
        flipContainer.classList.remove('flipping');
      }, 600); // 与 CSS 动画时间一致
    }
    
    setPrevPathname(location.pathname);
  }, [location.pathname, isRegisterPath]);

  // If still loading, show nothing
  if (loading) {
    return null;
  }

  // If already authenticated, redirect to the intended page or home
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <Box className="auth-layout">
      <Container component="main" className="auth-content">
        <Typography variant="h4" component="h1" className="auth-header">
          旅游笔记平台
        </Typography>
        <div className="flip-container">
          <div className="flip-card">
            <div className="flip-card-front">
              <Paper elevation={3} className="auth-card">
                <Outlet context={{ page: 'login' }} />
              </Paper>
            </div>
            <div className="flip-card-back">
              <Paper elevation={3} className="auth-card">
                <Outlet context={{ page: 'register' }} />
              </Paper>
            </div>
          </div>
        </div>
        <Typography variant="body2" color="textSecondary" align="center" className="auth-footer">
          旅游笔记平台 ©{new Date().getFullYear()} 版权所有
        </Typography>
      </Container>
    </Box>
  );
};

export default AuthLayout;