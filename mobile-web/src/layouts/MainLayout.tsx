import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box, AppBar, Container, Toolbar, Typography, Avatar, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Home as HomeIcon,
  AddCircle as AddCircleIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import NetworkStatusIndicator from '../components/NetworkStatusIndicator';
import '../styles/MainLayout.css';

// 创建刷新事件，用于跨组件通信
export const HOME_REFRESH_EVENT = 'home-refresh-event';

const MainLayout: React.FC = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated && ['/notes/create', '/notes/edit', '/profile', '/my/favorites', '/my/notes'].some(path => location.pathname.startsWith(path))) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 底部TabBar菜单
  const tabs = [
    { key: '/', icon: <HomeIcon />, label: '首页' },
    { key: '/notes/create', icon: <AddCircleIcon />, label: '发布' },
    { key: '/my/favorites', icon: <FavoriteIcon />, label: '收藏' },
    { key: '/my/notes', icon: <BookIcon />, label: '笔记' },
    { key: '/profile', icon: <PersonIcon />, label: '我的' },
  ];

  const handleTabClick = (key: string) => {
    if (key === '/profile' && !isAuthenticated) {
      navigate('/login');
    } else {
      // 如果点击的是首页且已经在首页，则触发自定义事件来刷新
      if (key === '/' && location.pathname === '/') {
        window.dispatchEvent(new CustomEvent(HOME_REFRESH_EVENT));
      } else {
        navigate(key);
      }
    }
  };

  // 获取当前激活的导航索引
  const getCurrentTabIndex = () => {
    const currentPath = location.pathname;
    const index = tabs.findIndex(tab => tab.key === currentPath);
    return index >= 0 ? index : 0; // 默认选中首页
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" color="default" elevation={1} sx={{ top: 0, height: 48, bgcolor: 'white' }}>
        <Toolbar variant="dense" sx={{ minHeight: 48, justifyContent: 'center' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            小罗书
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* 网络状态指示器 */}
      <NetworkStatusIndicator position="top" />
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        marginTop: '48px', 
        marginBottom: '56px', 
        overflow: 'auto', 
        minHeight: 'calc(100vh - 104px)'
      }}>
        <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
          <Outlet />
        </Container>
      </Box>
      
      <Paper sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000 
      }} elevation={3}>
        <BottomNavigation
          showLabels
          value={getCurrentTabIndex()}
          sx={{ height: 56 }}
        >
          {tabs.map((tab) => (
            <BottomNavigationAction
              key={tab.key}
              label={tab.label}
              icon={tab.key === '/profile' && isAuthenticated ? (
                <Avatar 
                  sx={{ width: 24, height: 24 }}
                  src={user?.avatar}
                  alt={user?.username}
                >
                  <PersonIcon />
                </Avatar>
              ) : tab.icon}
              onClick={() => handleTabClick(tab.key)}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MainLayout;