import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/client';
import ShareDialog from '../components/ShareDialog';
import SharePoster from '../components/SharePoster';
import { getMediaUrlSync ,getMultipleMediaUrls} from '../utils/media';
import NoteHeaderBar from '../components/NoteHeaderBar';
import NoteMediaCarousel from '../components/NoteMediaCarousel';
import NoteContent from '../components/NoteContent';
import NoteActions from '../components/NoteActions';
import NoteCommentList from '../components/NoteCommentList';

interface CommentItem {
  id: number;
  content: string;
  userId: number;
  username: string;
  avatar: string;
  createTime: string;
  likeCount?: number;
  isLiked?: boolean;
}

// 自定义样式组件
const RedXsButton = styled(Button)(({ theme }) => ({
  color: '#ff2442',
  borderColor: '#ff2442',
  backgroundColor: 'white',
  borderRadius: '20px',
  fontSize: '12px',
  padding: '4px 12px',
  '&:hover': {
    borderColor: '#ff2442',
    backgroundColor: 'rgba(255, 36, 66, 0.04)',
  },
}));

const XsImage = styled('img')({
  width: '100%',
  borderRadius: '4px',
  marginBottom: '8px',
});

const CommentCard = styled(Box)(({ theme }) => ({
  padding: '12px 0',
  borderBottom: '1px solid #f0f0f0',
}));

const RelatedSearchBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f6f6f6',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '16px 0',
}));

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  // 新增状态：分享相关
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [posterDialogOpen, setPosterDialogOpen] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaIndex, setMediaIndex] = useState(0);
  const fetchNoteDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/notes/${id}`);
      setNote(response.data.data);

      if (isAuthenticated && user?.userId) {
        const likeResponse = await axios.get(`/api/notes/${id}/is-liked`);
        setIsLiked(likeResponse.data.data);

        const favoriteResponse = await axios.get(`/api/notes/${id}/is-favorited`);
        setIsFavorited(favoriteResponse.data.data);
        
        // 检查是否关注了作者
        // if (response.data.data.userId !== user?.userId) {
        //   const followingResponse = await axios.get(`/api/users/${response.data.data.userId}/is-following`);
        //   setIsFollowing(followingResponse.data.data);
        // }
      }
    } catch (error) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, user, navigate]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`/api/notes/${id}/comments`);
      // 为每条评论添加点赞状态的初始值
      const commentData = response.data.data.map((comment: any) => ({
        ...comment,
        likeCount: comment.likeCount || Math.floor(Math.random() * 20),
        isLiked: false
      }));
      setComments(commentData);
    } catch {}
  }, [id]);

  useEffect(() => {
    fetchNoteDetail();
    fetchComments();
  }, [id, fetchNoteDetail, fetchComments]);

  useEffect(() => {
    if (note && note.media && note.media.length > 0) {
      const urls = note.media.map((item: any) => item.url);
      getMultipleMediaUrls(urls).then(setMediaUrls);
    }
  }, [note]);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try {
      if (isLiked) {
        await axios.delete(`/api/notes/${id}/like`);
        setNote({ ...note, likeCount: note.likeCount - 1 });
      } else {
        await axios.post(`/api/notes/${id}/like`);
        setNote({ ...note, likeCount: note.likeCount + 1 });
      }
      setIsLiked(!isLiked);
    } catch {}
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    try {
      if (isFavorited) {
        await axios.delete(`/api/notes/${id}/favorite`);
        setNote({ ...note, favoriteCount: note.favoriteCount - 1 });
      } else {
        await axios.post(`/api/notes/${id}/favorite`);
        setNote({ ...note, favoriteCount: note.favoriteCount + 1 });
      }
      setIsFavorited(!isFavorited);
    } catch {}
  };

  const handleFollow = async () => {
    if (!isAuthenticated) return;
    try {
      if (isFollowing) {
        await axios.delete(`/api/users/${note.userId}/follow`);
      } else {
        await axios.post(`/api/users/${note.userId}/follow`);
      }
      setIsFollowing(!isFollowing);
    } catch {}
  };

  const handleComment = () => {
    if (!isAuthenticated) return;
    setCommentVisible(true);
  };

  const submitComment = async () => {
    if (!commentContent.trim()) return;
    try {
      setCommentLoading(true);
      await axios.post(`/api/notes/${id}/comments`, { content: commentContent });
      setCommentContent('');
      setCommentVisible(false);
      setNote({ ...note, commentCount: note.commentCount + 1 });
      fetchComments();
    } catch {} finally {
      setCommentLoading(false);
    }
  };

  const handleCommentLike = (commentId: number) => {
    if (!isAuthenticated) return;
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likeCount: comment.isLiked 
              ? (comment.likeCount || 1) - 1 
              : (comment.likeCount || 0) + 1
          }
        : comment
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
      return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays < 7) {
      return `${diffDays}天前 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  };

  // 生成分享链接
  const getShareUrl = () => {
    return `${window.location.origin}/notes/${id}`;
  };

  // 获取封面图片
  const getCoverImage = () => {
    if (note && note.coverUrl) {
      return note.coverUrl;
    } else if (note && note.media && note.media.length > 0) {
      const imageMedia = note.media.find((item: any) => item.type === 0);
      return imageMedia ? imageMedia.url : '';
    }
    return '';
  };
  
  // 处理分享按钮点击
  const handleShare = () => {
    setShareDialogOpen(true);
  };
  
  // 处理打开海报弹窗
  const handleOpenPoster = () => {
    setShareDialogOpen(false);
    setPosterDialogOpen(true);
  };

  if (loading || !note) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#ff2442' }} />
      </Box>
    );
  }

  // 生成一些相关搜索关键词
  const relatedTags = [
    note.title.split(' ')[0],
    note.location,
    '旅游攻略',
    `${note.location}美食`,
    `${note.location}景点`
  ].filter(Boolean);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', bgcolor: '#fff', pb: 8 }}>
      <NoteHeaderBar
        avatar={getMediaUrlSync(note.userAvatar)}
        username={note.username}
        isFollowing={isFollowing}
        isSelf={note.userId === user?.userId}
        onBack={() => navigate(-1)}
        onFollow={handleFollow}
        onShare={handleShare}
      />
      {note.media && note.media.length > 0 && (
        <NoteMediaCarousel
          media={note.media}
          mediaUrls={mediaUrls}
          onFullScreen={setMediaIndex}
          currentIndex={mediaIndex}
          onIndexChange={setMediaIndex}
        />
      )}
      <NoteContent
        title={note.title}
        content={note.content}
        location={note.location}
        createTime={formatDate(note.createTime)}
        tags={relatedTags}
      />
      <NoteActions
        isLiked={isLiked}
        isFavorited={isFavorited}
        likeCount={note.likeCount || 0}
        favoriteCount={note.favoriteCount || 0}
        commentCount={note.commentCount || 0}
        onLike={handleLike}
        onFavorite={handleFavorite}
        onComment={handleComment}
      />
      {/* 评论区抽离为组件 */}
      <NoteCommentList
        comments={comments}
        onLike={handleCommentLike}
        formatDate={formatDate}
      />
      {/* 分享对话框 */}
      <ShareDialog 
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        title={note.title}
        content={note.content?.substring(0, 50) + (note.content?.length > 50 ? '...' : '')}
        imageUrl={getMediaUrlSync(getCoverImage())}
        shareUrl={getShareUrl()}
      />
      
      {/* 分享海报 */}
      <SharePoster
        open={posterDialogOpen}
        onClose={() => setPosterDialogOpen(false)}
        title={note.title}
        content={note.content || ''}
        imageUrl={getMediaUrlSync(getCoverImage())}
        authorName={note.username || ''}
        authorAvatar={getMediaUrlSync(note.userAvatar)}
        shareUrl={getShareUrl()}
      />
      
      {/* 评论弹窗 */}
      <Dialog
        open={commentVisible}
        onClose={() => setCommentVisible(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>发表评论</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            minRows={4}
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            placeholder="说说你的看法..."
            fullWidth
            inputProps={{ maxLength: 500 }}
            helperText={`${commentContent.length}/500`}
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={() => setCommentVisible(false)}
              sx={{ mr: 2 }}
              disabled={commentLoading}
            >
              取消
            </Button>
            <Button
              variant="contained"
              onClick={submitComment}
              disabled={commentLoading}
              sx={{ 
                bgcolor: '#ff2442',
                '&:hover': {
                  bgcolor: '#e01f3d',
                }
              }}
            >
              发表
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default NoteDetail;