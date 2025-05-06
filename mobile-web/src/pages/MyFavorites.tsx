import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  Avatar, 
  Button, 
  Grid, 
  Box, 
  Skeleton, 
  CircularProgress 
} from '@mui/material';
import { 
  Favorite as FavoriteIcon, 
  ChatBubble as MessageIcon, 
  Visibility as EyeIcon, 
  Person as PersonIcon 
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
  username: string;
  userAvatar: string;
  location: string;
}

const MyFavorites: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const message = useMessage();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    fetchFavorites();
  }, [isAuthenticated, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/favorites');
      setNotes(response.data.data);
    } catch (error) {
      message.error('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFavorite = async (noteId: number) => {
    try {
      await axios.delete(`/api/notes/${noteId}/favorite`);
      message.success('取消收藏成功');
      // 更新列表
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleViewNote = (id: number) => {
    navigate(`/notes/${id}`);
  };

  return (
    <Box className="my-notes-container">
      <Typography variant="h5" component="h2" className="page-title">我的收藏</Typography>

      {loading ? (
        <Grid container spacing={2}>
          {Array(6).fill(0).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={140} />
                  <Skeleton variant="text" height={40} sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mt: 1 }} width="60%" />
                  <Box sx={{ display: 'flex', mt: 2, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={30} height={30} />
                    <Skeleton variant="text" height={20} sx={{ ml: 1 }} width="40%" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : notes.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '200px',
          color: 'text.secondary'
        }}>
          <Typography variant="body1">暂无收藏的笔记</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {notes.map(note => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={note.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box 
                  className="note-cover" 
                  sx={{ position: 'relative' }}
                  onClick={() => handleViewNote(note.id)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={getMediaUrlSync(note.coverUrl)}
                    alt={note.title}
                  />
                  {note.location && (
                    <Box 
                      className="note-location" 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        padding: '2px 8px',
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        color: 'white', 
                        borderRadius: '0 4px 0 0' 
                      }}
                    >
                      {note.location}
                    </Box>
                  )}
                </Box>
                <CardContent 
                  onClick={() => handleViewNote(note.id)} 
                  sx={{ flexGrow: 1, cursor: 'pointer' }}
                >
                  <Typography variant="h6" component="h3" className="note-title" gutterBottom noWrap>
                    {note.title}
                  </Typography>
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
                  
                  <Box className="note-author" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Avatar 
                      sx={{ width: 24, height: 24, mr: 1 }}
                      src={getMediaUrlSync(note.userAvatar)}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {note.username}
                    </Typography>
                  </Box>
                  
                  <Box className="note-stats" sx={{ display: 'flex', mt: 1, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EyeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {note.viewCount}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FavoriteIcon fontSize="small" sx={{ mr: 0.5 }} />
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
                    startIcon={<FavoriteIcon />}
                    onClick={() => handleCancelFavorite(note.id)}
                    color="primary"
                    size="small"
                  >
                    取消收藏
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyFavorites;