import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TextField, Button, Card, CardContent, Typography, 
  Box, CircularProgress, Stack, Paper, AppBar, Toolbar, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/client';
import '../styles/NoteForm.css';
import MediaEditor, { CustomUploadFile } from '../components/MediaEditor';
import { useMessage } from '../utils/message';
import { isAndroid } from '../utils/platform';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

// 定义编辑区域类型，与NoteCreate保持一致
type SectionType = 'media' | 'title' | 'content' | 'location' | null;

const NoteEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const message = useMessage();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [formValues, setFormValues] = useState({
    title: '',
    content: '',
    location: ''
  });
  
  // 添加当前活动区域状态，与NoteCreate保持一致
  const [activeSection, setActiveSection] = useState<SectionType>(null);

  // 定义fetchNoteDetail使用useCallback以避免依赖循环
  const fetchNoteDetail = useCallback(async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`/api/notes/${id}`);
      const noteData = response.data.data;

      // 检查是否为笔记作者
      if (noteData.userId !== user?.userId) {
        message.error('无权编辑该笔记');
        navigate('/');
        return;
      }

      // 设置表单初始值
      setFormValues({
        title: noteData.title || '',
        content: noteData.content || '',
        location: noteData.location || '',
      });

      // 设置封面URL，保持原始路径
      const coverUrl = noteData.coverUrl || '';
      setCoverUrl(coverUrl);

      // 设置媒体文件，保持原始路径
      if (noteData.media && noteData.media.length > 0) {
        const mediaFiles = noteData.media.map((item: any, index: number) => {
          return {
            uid: `-${index}`,
            name: `媒体文件${index + 1}`,
            status: 'done',
            url: item.url,  // 保持原始路径，不转换为完整URL
            type: item.type === 0 ? 'image/jpeg' : 'video/mp4',
            response: { data: { url: item.url } }
          };
        });
        setFileList(mediaFiles);
      } else {
        setFileList([]);
      }
    } catch (error) {
      message.error('获取笔记详情失败');
      navigate('/');
    } finally {
      setInitialLoading(false);
    }
  }, [id, user, navigate, message]);

  // 检查登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    
    fetchNoteDetail();
  }, [isAuthenticated, id, user]);

  // 为Android添加返回按钮功能和硬件返回键处理
  useEffect(() => {
    if (isAndroid() && Capacitor.isNativePlatform()) {
      const handleBackButton = () => {
        handleBack();
        return true;
      };
      
      // 注册硬件返回键监听
      App.addListener('backButton', handleBackButton);
      
      return () => {
        // 组件卸载时移除监听
        App.removeAllListeners();
      };
    }
  }, [navigate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // 检查所有文件是否上传完成
    const isAllUploaded = fileList.every(file => file.status === 'done');
    if (!isAllUploaded) {
      message.warning('请等待所有文件上传完成');
      return;
    }
    
    if (fileList.length === 0) {
      message.warning('请至少上传一张图片');
      return;
    }

    if (!coverUrl) {
      message.warning('请选择封面图片');
      return;
    }

    try {
      setLoading(true);

      // 处理媒体文件
      const mediaList = fileList.map((file, index) => ({
        url: file.url || (file.response?.data.url || ''),
        type: file.type?.startsWith('image/') ? 0 : 1,
        ordering: index,
      }));

      // 提交更新
      const noteData = {
        title: formValues.title,
        content: formValues.content,
        location: formValues.location,
        coverUrl: coverUrl,
        media: mediaList
      };

      await axios.put(`/api/notes/${id}`, noteData);
      message.success('笔记更新成功，等待审核');
      navigate(`/notes/${id}`);
    } catch (error) {
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单字段变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理媒体编辑器的变化
  const handleMediaChange = (newFileList: CustomUploadFile[], newCoverUrl: string) => {
    setFileList(newFileList);
    setCoverUrl(newCoverUrl);
  };

  // 设置当前活动的编辑区域
  const handleFocus = (section: SectionType) => () => {
    setActiveSection(section);
  };

  // 失去焦点时的处理函数
  const handleBlur = () => {
    // 可以选择不设置为null，保持最后编辑区域的扩展状态
    // setActiveSection(null);
  };

  // 处理后退按钮点击
  const handleBack = () => {
    // 如果有数据变更，显示确认对话框
    if (formValues.title || formValues.content || formValues.location || fileList.length > 0) {
      if (window.confirm('确定要返回吗？未保存的修改将丢失。')) {
        navigate(`/notes/${id}`);
      }
    } else {
      navigate(`/notes/${id}`);
    }
  };

  // 获取区域容器样式
  const getSectionStyle = (section: SectionType) => {
    const isActive = activeSection === section;
    const isAnyActive = activeSection !== null;
    
    return {
      transition: 'all 0.3s ease',
      padding: '16px',
      marginBottom: '0px',
      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
      borderRadius: '8px',
      boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
      transform: isActive ? 'scale(1.02)' : 'scale(1)',
      maxHeight: isAnyActive && !isActive ? '120px' : '800px',
      overflow: isAnyActive && !isActive ? 'hidden' : 'visible',
      opacity: isAnyActive && !isActive ? 0.8 : 1,
      zIndex: isActive ? 10 : 1,
      position: 'relative' as 'relative',
    };
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="note-form-container">
      {/* 顶部工具栏 */}
      <AppBar 
        position="fixed" 
        color="transparent" 
        elevation={0}
        sx={{ 
          top: 48, 
          bgcolor: 'white', 
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '48px' }}>
          {/* 左侧返回按钮 */}
          <IconButton 
            edge="start" 
            onClick={handleBack} 
            sx={{ color: '#333' }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          {/* 右侧提交按钮 */}
          <IconButton
            edge="end"
            onClick={handleSubmit}
            disabled={loading}
            color="primary"
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <CheckIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* 主内容区域，加入顶部边距给固定的AppBar留出空间 */}
      <Card className="note-form-card" sx={{ maxWidth: 800, mx: 'auto', my: 0, mt: 4,mb: 0 }}>
        <CardContent>
          {/* <Typography variant="h5" component="h2" gutterBottom>
            编辑旅游笔记
          </Typography> */}
          
          {/* <Box component="form" onSubmit={handleSubmit}> */}
            {/* 媒体编辑区 */}
            <Paper 
              elevation={0}
              sx={getSectionStyle('media')}
              onClick={handleFocus('media')}
              onBlur={handleBlur}
              style={{//非常重要的样式配置，解决MediaEditor偏移
                position: 'relative',
                transform: 'none',
              }}
            >
              <Typography 
                variant="subtitle1"
                sx={{ 
                  fontWeight: activeSection === 'media' ? 'bold' : 'normal',
                  fontSize: activeSection === 'media' ? '1.1rem' : '1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                照片/视频
              </Typography>
              {(activeSection === 'media' || activeSection === null) && (
                <Typography variant="caption" color="textSecondary">
                  支持图片和视频格式，单个文件不超过10MB
                </Typography>
              )}
              <Box 
                mt={1} 
                mb={0}
                sx={{
                  opacity: activeSection === 'media' || activeSection === null ? 1 : 0.7,
                  transition: 'opacity 0.3s ease'
                }}
              >
                <MediaEditor 
                  fileList={fileList}
                  coverUrl={coverUrl}
                  onChange={handleMediaChange}
                  maxCount={9}
                />
              </Box>
            </Paper>
            
            {/* 标题编辑区 */}
            <Paper 
              elevation={0}
              sx={getSectionStyle('title')}
              onClick={handleFocus('title')}
              onBlur={handleBlur}
            >
              <TextField
                name="title"
                label="标题"
                value={formValues.title}
                onChange={handleChange}
                onFocus={handleFocus('title')}
                fullWidth
                required
                margin="none"
                placeholder="输入旅游笔记标题"
                sx={{
                  '& .MuiInputBase-root': { 
                    fontSize: activeSection === 'title' ? '1.2rem' : '0.8rem',
                    transition: 'all 0.3s ease'
                  }
                }}
              />
            </Paper>
            
            {/* 内容编辑区 */}
            <Paper 
              elevation={0}
              sx={getSectionStyle('content')}
              onClick={handleFocus('content')}
              onBlur={handleBlur}
            >
              <TextField
                name="content"
                label="内容"
                value={formValues.content}
                onChange={handleChange}
                onFocus={handleFocus('content')}
                fullWidth
                required
                multiline
                rows={activeSection === 'content' ? 5 : 1}
                margin="none"
                placeholder="分享你的旅游经历..."
                inputProps={{ maxLength: 2000 }}
                helperText={`${formValues.content.length}/2000`}
                sx={{
                  transition: 'all 0.3s ease'
                }}
              />
            </Paper>
            
            {/* 位置编辑区 */}
            <Paper 
              elevation={0}
              sx={getSectionStyle('location')}
              onClick={handleFocus('location')}
              onBlur={handleBlur}
            >
              <TextField
                name="location"
                label="位置"
                value={formValues.location}
                onChange={handleChange}
                onFocus={handleFocus('location')}
                fullWidth
                margin="normal"
                placeholder="输入旅游地点"
              />
            </Paper>
          {/* </Box> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteEdit;