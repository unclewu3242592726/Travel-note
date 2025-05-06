import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography,
  InputAdornment,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon, 
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMessage } from '../utils/message';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const message = useMessage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // 表单状态
  const [formValues, setFormValues] = useState({
    username: '',
    password: ''
  });
  
  // 表单错误状态
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: ''
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
  };

  // 表单验证
  const validateForm = () => {
    const errors = { ...formErrors };
    let isValid = true;

    // 用户名验证
    if (!formValues.username) {
      errors.username = '请输入用户名';
      isValid = false;
    }

    // 密码验证
    if (!formValues.password) {
      errors.password = '请输入密码';
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
      await login(formValues.username, formValues.password);
      message.success('登录成功');
    } catch (error: any) {
      // 错误处理逻辑
      let errorMessage = '登录失败，请检查用户名和密码';
      
      console.error('Login error:', error);
      
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

  // 记住我选项切换
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  // 跳转到注册页面
  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="auth-form-container">
      <Typography variant="h5" align="center" gutterBottom>
        账号登录
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
          autoComplete="current-password"
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={rememberMe}
                onChange={handleRememberMeChange}
                name="rememberMe"
                color="primary"
              />
            }
            label="记住我"
          />
          <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
            忘记密码？
          </Link>
        </Box>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} /> : '登录'}
        </Button>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2,
            cursor: 'pointer'
          }}
          onClick={goToRegister}
        >
          <Typography color="primary">
            没有账号？立即注册
          </Typography>
          <ArrowForwardIcon color="primary" fontSize="small" sx={{ ml: 0.5 }} />
        </Box>
      </Box>
    </div>
  );
};

export default Login;