import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, Grid, Card, CardMedia, Typography, 
  Box, IconButton, CircularProgress, Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import axios from '../api/client';
import { getMediaUrlSync } from '../utils/media';
import { useMessage } from '../utils/message';
import '../styles/MediaEditor.css';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// 文件类型定义
export interface CustomUploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  type?: string;
  size?: number;
  percent?: number;
  originFileObj?: File;
  response?: {
    data: {
      url: string;
    }
  };
}

interface MediaEditorProps {
  fileList: CustomUploadFile[];
  coverUrl: string;
  onChange: (fileList: CustomUploadFile[], coverUrl: string) => void;
  maxCount?: number;
}

const MediaEditor: React.FC<MediaEditorProps> = ({
  fileList,
  coverUrl,
  onChange,
  maxCount = 9
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const message = useMessage();
  // 添加一个编辑中的状态标志，避免因拖拽或上传导致的意外重新获取数据
  const [isEditing, setIsEditing] = useState(false);
  
  // 用于始终获取最新的 fileList 状态
  const fileListRef = useRef(fileList);
  useEffect(() => {
    fileListRef.current = fileList;
  }, [fileList]);
  
  // 当编辑状态变化时通知父组件，但不要频繁触发
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEditing) {
      // 如果处于编辑中，设置一个定时器在编辑结束后通知父组件
      timer = setTimeout(() => {
        setIsEditing(false);
      }, 500); // 500ms后自动结束编辑状态
    }
    return () => clearTimeout(timer);
  }, [isEditing, fileList]);
  
  // 触发文件选择
  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // 标记为编辑中状态
    setIsEditing(true);
    
    // 检查是否超出最大文件数
    if (fileListRef.current.length + files.length > maxCount) {
      message.warning(`最多只能上传${maxCount}个文件`);
      return;
    }
    
    const newFiles: CustomUploadFile[] = Array.from(files).map((file, index) => ({
      uid: `new-${Date.now()}-${index}`,
      name: file.name,
      status: 'uploading',
      percent: 0,
      type: file.type,
      size: file.size,
      originFileObj: file
    }));
    
    // 更新文件列表，添加新选择的文件
    const updatedFileList = [...fileListRef.current, ...newFiles];
    
    // 如果没有文件之前，则第一个文件默认为封面
    const newCoverUrl = coverUrl || (
      newFiles[0]?.type?.startsWith('image/') ? 
      (newFiles[0].url || '') : 
      coverUrl
    );
    
    onChange(updatedFileList, newCoverUrl);
    
    // 单独上传每个文件
    for (const newFile of newFiles) {
      await uploadFile(newFile);
    }
    
    // 清空文件输入，以便可以再次选择相同的文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 上传文件
  const uploadFile = async (file: CustomUploadFile) => {
    if (!file.originFileObj) return;
    
    // 标记为编辑中状态
    setIsEditing(true);
    
    const formData = new FormData();
    formData.append('file', file.originFileObj);
    formData.append('type', file.type?.startsWith('image/') ? 'image' : 'video');
    
    try {
      const response = await axios.post('/api/upload/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // 更新上传进度
            updateFileProgress(file.uid, percent);
          }
        },
      });
      
      // 上传成功，更新文件状态
      updateFileStatus(file.uid, 'done', response.data);
      
      // 如果没有封面，且当前上传的是图片，则将其设置为封面（确保是第一个图片）
      if (!coverUrl && file.type?.startsWith('image/') && fileListRef.current.findIndex(f => f.uid === file.uid) === 0) {
        const newCoverUrl = response.data.data.url;
        onChange(
          fileListRef.current.map(f => f.uid === file.uid ? { 
            ...f, 
            status: 'done',
            url: response.data.data.url,
            response: response.data
          } : f),
          newCoverUrl
        );
      }
    } catch (error) {
      updateFileStatus(file.uid, 'error');
      message.error('上传失败');
    }
  };
  
  // 更新文件上传进度
  const updateFileProgress = (uid: string, percent: number) => {
    // 标记为编辑中状态
    setIsEditing(true);
    
    const updatedFileList = fileListRef.current.map(file => 
      file.uid === uid ? { ...file, percent } : file
    );
    onChange(updatedFileList, coverUrl);
  };
  
  // 更新文件状态
  const updateFileStatus = (uid: string, status: 'done' | 'error', response?: any) => {
    // 标记为编辑中状态
    setIsEditing(true);
    
    const updatedFileList = fileListRef.current.map(file => {
      if (file.uid === uid) {
        const updatedFile = { ...file, status };
        if (status === 'done' && response) {
          updatedFile.url = response.data.url;
          updatedFile.response = response;
        }
        return updatedFile;
      }
      return file;
    });
    onChange(updatedFileList, coverUrl);
  };
  
  // 删除文件
  const handleRemoveFile = (uid: string) => {
    // 标记为编辑中状态
    setIsEditing(true);
    
    const fileIndex = fileListRef.current.findIndex(file => file.uid === uid);
    const updatedFileList = fileListRef.current.filter(file => file.uid !== uid);
    
    // 更新封面URL，如果删除的文件是第一个，且更新后的列表还有图片，则将第一个图片设为封面
    let newCoverUrl = coverUrl;
    if (fileIndex === 0 && updatedFileList.length > 0) {
      // 查找第一个图片文件作为新封面
      const firstImage = updatedFileList.find(file => file.type?.startsWith('image/'));
      if (firstImage) {
        newCoverUrl = firstImage.url || (firstImage.response?.data.url || '');
      } else {
        newCoverUrl = ''; // 无图片可用
      }
    } else if (updatedFileList.length === 0) {
      newCoverUrl = ''; // 列表为空
    }
    
    onChange(updatedFileList, newCoverUrl);
  };
  
  // 处理拖拽结束事件
  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return; // 拖拽被取消
    }
    
    // 标记为编辑中状态
    setIsEditing(true);
    
    // 获取重新排序的列表
    const items = Array.from(fileListRef.current);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // 如果第一个项目变化了，且新的第一个项目是图片，则更新封面
    let newCoverUrl = coverUrl;
    if (result.destination.index === 0 || result.source.index === 0) {
      // 如果有图片，第一个图片设为封面
      const firstImage = items.find(file => file.type?.startsWith('image/'));
      if (firstImage) {
        newCoverUrl = firstImage.url || (firstImage.response?.data.url || '');
      }
    }
    
    onChange(items, newCoverUrl);
    message.success('媒体顺序已更新，第一张图片将作为封面');
  };

  return (
    <div className="media-editor">
      {/* 文件选择器 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {/* 拖拽区域 */}
      <Typography 
        variant="subtitle2" 
        color={fileList.length > 0 ? 'primary' : 'textSecondary'}
        sx={{ mb: 1, fontWeight: 'bold' }}
      >
        {fileList.length > 0 ? 
          '拖拽排序，第一张图片将自动设为封面' : 
          '请上传媒体文件'}
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="media-list" direction="horizontal">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}
              >
                {fileList.map((file, index) => (
                  <Draggable key={file.uid} draggableId={file.uid} index={index}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ position: 'relative' }}
                      >
                        <Card 
                          sx={{ 
                            width: 100, 
                            height: 100,
                            position: 'relative',
                            border: index === 0 ? '2px solid #1976d2' : 'none',
                          }}
                        >
                          {file.status === 'uploading' && (
                            <Box 
                              sx={{ 
                                position: 'relative', 
                                top: 0, 
                                left: 0, 
                                right: 0, 
                                bottom: 0, 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 2
                              }}
                            >
                              <CircularProgress size={40} variant="determinate" value={file.percent || 0} />
                              <Typography 
                                variant="caption" 
                                sx={{ position: 'absolute', color: 'white' }}
                              >
                                {`${file.percent || 0}%`}
                              </Typography>
                            </Box>
                          )}
                          <CardMedia
                            component={file.type?.startsWith('video/') ? 'video' : 'img'}
                            sx={{ height: 100, objectFit: 'cover' }}
                            image={
                              (file.url ? getMediaUrlSync(file.url) : '') || 
                              (file.response?.data.url ? getMediaUrlSync(file.response.data.url) : '') || 
                              (file.originFileObj && URL.createObjectURL(file.originFileObj)) || 
                              ''
                            }
                            title={file.name}
                          />
                          {index === 0 && file.type?.startsWith('image/') && (
                            <Badge
                              color="primary"
                              badgeContent="封面"
                              sx={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                              }}
                            />
                          )}
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                              cursor: 'grab',
                              color: 'white',
                              bgcolor: 'rgba(0,0,0,0.5)',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <DragHandleIcon fontSize="small" />
                          </Box>
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
                            onClick={() => handleRemoveFile(file.uid)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Card>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
        
        {fileList.length < maxCount && (
          <Card 
            sx={{ 
              width: 100, 
              height: 100, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={handleClickUpload}
          >
            <Box sx={{ textAlign: 'center' }}>
              <AddIcon />
              <Typography variant="body2">上传</Typography>
            </Box>
          </Card>
        )}
      </Box>
      
      {/* 当前封面预览提示 */}
      {fileList.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImageIcon color="primary" fontSize="small" />
          <Typography variant="body2" color="textSecondary">
            当前封面为第一张图片，可通过拖拽调整顺序
          </Typography>
        </Box>
      )}
      
      {/* 传递编辑状态的隐藏元素（用于调试） */}
      <input type="hidden" data-editing={isEditing ? "true" : "false"} />
    </div>
  );
};

export default MediaEditor;