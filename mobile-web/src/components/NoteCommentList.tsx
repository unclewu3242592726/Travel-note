import React from 'react';
import { Box, Avatar, Typography, Button, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

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

interface NoteCommentListProps {
  comments: CommentItem[];
  onLike: (commentId: number) => void;
  formatDate: (dateString: string) => string;
}

const NoteCommentList: React.FC<NoteCommentListProps> = ({ comments, onLike, formatDate }) => {
  if (!comments || comments.length === 0) return null;
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
        全部评论({comments.length})
      </Typography>
      {comments.map((item) => (
        <Box key={item.id} sx={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex' }}>
            <Avatar 
              src={item.avatar} 
              alt={item.username}
              sx={{ width: 36, height: 36, mr: 1.5 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>{item.username}</Typography>
              <Typography 
                variant="body2" 
                sx={{ my: 0.5, fontSize: '15px', lineHeight: 1.5, color: '#333' }}
              >
                {item.content}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#999', fontSize: '12px' }}>
                <Typography variant="caption">{formatDate(item.createTime)}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button variant="text" size="small" sx={{ minWidth: 'auto', color: '#999', fontSize: '12px', mr: 1 }}>
                    回复
                  </Button>
                  <IconButton size="small" onClick={() => onLike(item.id)} sx={{ p: 0.5, color: item.isLiked ? '#ff2442' : '#999' }}>
                    <FavoriteIcon sx={{ fontSize: '14px' }} />
                  </IconButton>
                  <Typography variant="caption" sx={{ ml: 0.5 }}>{item.likeCount || 0}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default NoteCommentList;
