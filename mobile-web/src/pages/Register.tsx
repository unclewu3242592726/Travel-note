import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../utils/message';
import '../styles/Auth.css';

const Register: React.FC = () => {
  const { register } = useAuth();
  const message = useMessage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 表单状态
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    confirm: '',
    email: '',
    mobile: ''
  });
  
  // 表单错误状态
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: '',
    confirm: '',
    email: '',
    mobile: ''
  });

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // 清除该字段的错误
    setFormErrors({
      ...formErrors,
      [name]: ''
    });
    
    // 特殊处理确认密码
    if (name === 'confirm' || name === 'password') {
      if (name === 'password' && formValues.confirm && value !== formValues.confirm) {
        setFormErrors(prev => ({
          ...prev,
          confirm: '两次输入的密码不一致'
        }));
      } else if (name === 'confirm' && value !== formValues.password) {
        setFormErrors(prev => ({
          ...prev,
          confirm: '两次输入的密码不一致'
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          confirm: ''
        }));
      }
    }
  };

  // 表单验证
  const validateForm = () => {
    const errors = { ...formErrors };
    let isValid = true;

    // 用户名验证
    if (!formValues.username) {
      errors.username = '请输入用户名';
      isValid = false;
    } else if (formValues.username.length < 4 || formValues.username.length > 20) {
      errors.username = '用户名长度在4-20个字符之间';
      isValid = false;
    }

    // 密码验证
    if (!formValues.password) {
      errors.password = '请输入密码';
      isValid = false;
    } else if (formValues.password.length < 6) {
      errors.password = '密码至少6个字符';
      isValid = false;
    }

    // 确认密码
    if (!formValues.confirm) {
      errors.confirm = '请确认密码';
      isValid = false;
    } else if (formValues.confirm !== formValues.password) {
      errors.confirm = '两次输入的密码不一致';
      isValid = false;
    }

    // 邮箱验证
    if (!formValues.email) {
      errors.email = '请输入邮箱';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = '请输入有效的邮箱地址';
      isValid = false;
    }

    // 手机号验证（选填）
    if (formValues.mobile && !/^1[3-9]\d{9}$/.test(formValues.mobile)) {
      errors.mobile = '请输入有效的手机号码';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register(
        formValues.username,
        formValues.password,
        formValues.email,
        formValues.mobile || undefined
      );
      message.success('注册成功');
    } catch (error: any) {
      // 错误处理逻辑
      let errorMessage = '注册失败，请重试';
      
      console.error('Registration error:', error);
      
      if (error.response) {
        // 从响应对象中提取错误信息
        const responseData = error.response.data;
        
        if (responseData) {
          // 直接使用返回的错误消息
          if (responseData.message) {
            errorMessage = responseData.message;
          } 
          // 兼容旧的错误格式
          else if (responseData.error) {
            errorMessage = responseData.error;
          }
        }
      } else if (error.message) {
        // 从错误对象中提取错误信息
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 跳转到登录页面
  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="auth-form-container">
      <Typography variant="h5" align="center" gutterBottom>
        注册账号
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="用户名"
          name="username"
          autoComplete="username"
          value={formValues.username}
          onChange={handleInputChange}
          error={!!formErrors.username}
          helperText={formErrors.username}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="密码"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formValues.password}
          onChange={handleInputChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirm"
          label="确认密码"
          type="password"
          id="confirm-password"
          autoComplete="new-password"
          value={formValues.confirm}
          onChange={handleInputChange}
          error={!!formErrors.confirm}
          helperText={formErrors.confirm}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="邮箱"
          name="email"
          autoComplete="email"
          value={formValues.email}
          onChange={handleInputChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="mobile"
          label="手机号（选填）"
          name="mobile"
          autoComplete="tel"
          value={formValues.mobile}
          onChange={handleInputChange}
          error={!!formErrors.mobile}
          helperText={formErrors.mobile}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : '注册'}
        </Button>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2,
            cursor: 'pointer'
          }}
          onClick={goToLogin}
        >
          <ArrowBackIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
          <Typography color="primary">
            已有账号？返回登录
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default Register;