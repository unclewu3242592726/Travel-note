import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Layout, Card } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AuthLayout.css';

const { Content } = Layout;

const AuthLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // If still loading, show nothing
  if (loading) {
    return null;
  }

  // If already authenticated, redirect to the intended page or dashboard
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <div className="auth-header">旅游笔记平台管理系统</div>
        <Card className="auth-card">
          <Outlet />
        </Card>
        <div className="auth-footer">旅游笔记平台管理系统 ©{new Date().getFullYear()} 版权所有</div>
      </Content>
    </Layout>
  );
};

export default AuthLayout; 