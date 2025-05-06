import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';
import { globalMessage } from '../contexts/GlobalMessage';
const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      await login(values.username, values.password);
      globalMessage.success('登录成功');
    } catch (error: any) {
      console.error('Login error:', error);
      globalMessage.error(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>管理员登录</h2>
      <Form
        name="login"
        className="auth-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入管理员用户名' }]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="管理员用户名" 
            size="large" 
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="密码" 
            size="large" 
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="auth-form-button" 
            loading={loading} 
            size="large"
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login; 