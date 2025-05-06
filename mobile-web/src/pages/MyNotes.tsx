import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Grid, 
  Box, 
  Skeleton, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Favorite as HeartIcon, 
  ChatBubble as MessageIcon, 
  Visibility as EyeIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/client';
import { getMediaUrlSync } from '../utils/media';
import { useMessage } from '../utils/message';
import '../styles/MyNotes.css';

interface NoteItem {
  id: number;
  title: string;
  content: string;
  coverUrl: string;
  createTime: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  status: number; // 0-待审核, 1-已通过, 2-已拒绝
}

const MyNotes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const message = useMessage();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    fetchMyNotes();
    // eslint-disable-next-line
  }, [isAuthenticated, navigate]);

  const fetchMyNotes = async () => {
    try {
      setLoading(true);
      // 注意：后端返回 { data: { content: NoteItem[], ... } }
      const response = await axios.get('/api/notes/users/notes');
      setNotes(response.data.data.content || []);
    } catch (error) {
      message.error('获取笔记列表失败');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (noteId: number) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleDeleteNote = async () => {
    if (noteToDelete === null) return;
    
    try {
      await axios.delete(`/api/notes/${noteToDelete}`);
      message.success('删除成功');
      // 更新列表
      setNotes(notes.filter(note => note.id !== noteToDelete));
      closeDeleteDialog();
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const handleEditNote = (id: number) => {
    navigate(`/notes/edit/${id}`);
  };

  const handleViewNote = (id: number) => {
    navigate(`/notes/${id}`);
  };

  const getStatusChipProps = (status: number) => {
    if (status === 0) {
      return { 
        label: '待审核',
        color: 'warning' as const,
        className: 'note-status note-status-pending'
      };
    } else if (status === 1) {
      return { 
        label: '已通过',
        color: 'success' as const,
        className: 'note-status note-status-approved'
      };
    } else {
      return { 
        label: '已拒绝',
        color: 'error' as const,
        className: 'note-status note-status-rejected'
      };
    }
  };

  const EmptyComponent = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '200px',
      color: 'text.secondary'
    }}>
      <Typography variant="body1" sx={{ mb: 2 }}>暂无笔记</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/notes/create')}
      >
        发布笔记
      </Button>
    </Box>
  );

  return (
    <Box className="my-notes-container">
      <Typography variant="h5" component="h2" className="page-title">我的笔记</Typography>

      {loading ? (
        <Grid container spacing={2}>
          {Array(6).fill(0).map((_, index) => (
            <Grid  size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={140} />
                  <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mt: 1 }} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : notes.length === 0 ? (
        <EmptyComponent />
      ) : (
        <Grid container spacing={2}>
          {notes.map(note => (
            <Grid  size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={note.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box 
                  className="note-cover" 
                  sx={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => handleViewNote(note.id)}
                >
                  <CardMedia
                    component="img"
                    height={140}
                    image={getMediaUrlSync(note.coverUrl)}
                    alt={note.title}
                  />
                </Box>
                <CardContent 
                  onClick={() => handleViewNote(note.id)} 
                  sx={{ flexGrow: 1, cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" component="h3" className="note-title" noWrap sx={{ flex: 1 }}>
                      {note.title}
                    </Typography>
                    <Chip 
                      size="small" 
                      {...getStatusChipProps(note.status)}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    className="note-content"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {note.content}
                  </Typography>
                  
                  <Box className="note-stats" sx={{ display: 'flex', mt: 2, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EyeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {note.viewCount}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HeartIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {note.likeCount}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MessageIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {note.commentCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleEditNote(note.id)}
                    size="small"
                    color="primary"
                  >
                    编辑
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => openDeleteDialog(note.id)}
                    size="small"
                    color="error"
                  >
                    删除
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这篇笔记吗？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleDeleteNote} color="error" autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyNotes;