import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  FlagOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AdminLayout.css';

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If still loading, show nothing
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle menu click
  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  // Handle user menu click
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  // User dropdown menu items
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <Layout className="admin-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={220}
        theme="dark"
        className="admin-sider"
      >
        <div className="logo">
          {collapsed ? '旅' : '旅游笔记后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['notes', 'users', 'reports']}
          items={[
            {
              key: '/',
              icon: <DashboardOutlined />,
              label: '数据面板',
              onClick: () => handleMenuClick('/'),
            },
            {
              key: 'notes',
              icon: <FileTextOutlined />,
              label: '笔记管理',
              children: [
                {
                  key: '/notes',
                  label: '已通过笔记',
                  onClick: () => handleMenuClick('/notes'),
                },
                {
                  key: '/notes/pending',
                  label: '待审核笔记',
                  onClick: () => handleMenuClick('/notes/pending'),
                },
                {
                  key: '/notes/rejected',
                  label: '未通过笔记',
                  onClick: () => handleMenuClick('/notes/rejected'),
                },
              ],
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: '用户管理',
              children: [
                {
                  key: '/users',
                  label: '正常用户',
                  onClick: () => handleMenuClick('/users'),
                },
                {
                  key: '/users/banned',
                  label: '已封禁用户',
                  onClick: () => handleMenuClick('/users/banned'),
                },
              ],
            },
            {
              key: 'reports',
              icon: <FlagOutlined />,
              label: '举报管理',
              children: [
                {
                  key: '/reports',
                  label: '举报记录',
                  onClick: () => handleMenuClick('/reports'),
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout className="admin-container">
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger-button"
          />
          <div className="user-area">
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="username">{user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
        <Footer className="admin-footer">旅游笔记平台管理系统 ©{new Date().getFullYear()} 版权所有</Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 