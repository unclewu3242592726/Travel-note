import React, { useState, useEffect, useRef } from 'react';
import {
  Card, CardContent, CardHeader, Avatar, Typography, Box,
  Tabs, Tab, TextField, Button, CircularProgress,
  IconButton, Paper, Divider, Container
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  PhotoCamera as PhotoCameraIcon,
  Logout as LogoutIcon,
  Save as SaveIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/client';
import { getMediaUrlSync } from '../utils/media';
import '../styles/Profile.css';

// TabPanel组件用于Tab内容展示
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    avatar: user?.avatar || '',
    introduction: '',
    mobile: '',
  });
  const [tabValue, setTabValue] = useState(0);
  const [formValues, setFormValues] = useState({
    username: user?.username || '',
    email: user?.email || '',
    mobile: '',
    introduction: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理Tab切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    // 加载用户详细信息
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/profile`);
        const data = response.data.data;
        
        setProfileData({
          avatar: data.avatar || '',
          introduction: data.introduction || '',
          mobile: data.mobile || '',
        });
        
        setFormValues({
          username: user?.username || '',
          email: user?.email || '',
          mobile: data.mobile || '',
          introduction: data.introduction || ''
        });
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchUserProfile();
    }
  }, [user?.userId, user?.username, user?.email]);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  // 处理密码表单输入变化
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
    
    // 验证确认密码
    if (name === 'confirmPassword' || name === 'newPassword') {
      if (name === 'newPassword' && passwordForm.confirmPassword && 
          passwordForm.confirmPassword !== value) {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: '两次输入的密码不一致'
        });
      } else if (name === 'confirmPassword' && passwordForm.newPassword && 
                passwordForm.newPassword !== value) {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: '两次输入的密码不一致'
        });
      } else {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: ''
        });
      }
    }
    
    // 验证密码长度
    if (name === 'newPassword') {
      if (value && value.length < 6) {
        setPasswordErrors({
          ...passwordErrors,
          newPassword: '密码至少6个字符'
        });
      } else {
        setPasswordErrors({
          ...passwordErrors,
          newPassword: ''
        });
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/api/users/profile`, {
        ...formValues,
        avatar: profileData.avatar
      });
      alert('个人资料更新成功');
    } catch (error) {
      alert('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      const response = await axios.post('/api/upload/avatar', formData);
      setProfileData({
        ...profileData,
        avatar: response.data.data.url
      });
      alert('头像上传成功');
    } catch (error) {
      alert('上传失败，请重试');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    if (!passwordForm.currentPassword) {
      setPasswordErrors({...passwordErrors, currentPassword: '请输入当前密码'});
      return;
    }
    
    if (!passwordForm.newPassword) {
      setPasswordErrors({...passwordErrors, newPassword: '请输入新密码'});
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordErrors({...passwordErrors, newPassword: '密码至少6个字符'});
      return;
    }
    
    if (!passwordForm.confirmPassword) {
      setPasswordErrors({...passwordErrors, confirmPassword: '请确认新密码'});
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({...passwordErrors, confirmPassword: '两次输入的密码不一致'});
      return;
    }
    
    try {
      setLoading(true);
      await axios.post('/api/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert('密码修改成功');
      // 重置表单
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      alert(error?.response?.data?.msg || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="md" className="profile-container">
      <Paper className="profile-card" elevation={0} sx={{ mt: 0, mb: 0 }}>
        <Box 
          className="profile-header" 
          sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            position: 'relative' 
          }}
        >
          <Box 
            sx={{ 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}
            onClick={() => fileInputRef.current?.click()}
            title="点击更换头像"
          >
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 1, 
                border: '2px solid #eee' 
              }} 
              src={getMediaUrlSync(profileData.avatar)}
            >
              <PersonIcon />
            </Avatar>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <Typography variant="caption" color="text.secondary">
              点击更换头像
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ mt: 1 }}>
            {user?.username || '用户'}
          </Typography>
          
          <IconButton
            color="error"
            sx={{ position: 'absolute', right: 16, top: 16 }}
            onClick={handleLogout}
            title="退出登录"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            centered
            aria-label="用户资料选项卡"
          >
            <Tab label="个人信息" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
            <Tab label="安全设置" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
          </Tabs>
        </Box>
        
        <CardContent>
          {/* 个人信息标签页 */}
          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleProfileUpdate} noValidate>
              <TextField
                margin="normal"
                fullWidth
                label="用户名"
                name="username"
                value={formValues.username}
                InputProps={{
                  readOnly: true,
                  startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                }}
                disabled
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="邮箱"
                name="email"
                value={formValues.email}
                InputProps={{
                  readOnly: true,
                  startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
                }}
                disabled
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="手机号"
                name="mobile"
                value={formValues.mobile}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="个人介绍"
                name="introduction"
                value={formValues.introduction}
                onChange={handleInputChange}
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                保存
              </Button>
            </Box>
          </TabPanel>
          
          {/* 安全设置标签页 */}
          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handlePasswordChange} noValidate>
              <TextField
                margin="normal"
                fullWidth
                label="当前密码"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordInputChange}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
                InputProps={{
                  startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="新密码"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordInputChange}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
                InputProps={{
                  startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="确认新密码"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInputChange}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                InputProps={{
                  startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
              >
                修改密码
              </Button>
            </Box>
          </TabPanel>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default Profile;