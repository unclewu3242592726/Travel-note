import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface NoteActionsProps {
  isLiked: boolean;
  isFavorited: boolean;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  onLike: () => void;
  onFavorite: () => void;
  onComment: () => void;
}

const NoteActions: React.FC<NoteActionsProps> = ({
  isLiked, isFavorited, likeCount, favoriteCount, commentCount, onLike, onFavorite, onComment
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', py: 1, mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={onLike} sx={{ color: isLiked ? '#ff2442' : '#666' }}>
        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
      <Typography sx={{ fontSize: '14px', color: '#666' }}>{likeCount}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={onFavorite} sx={{ color: isFavorited ? '#ff9c00' : '#666' }}>
        {isFavorited ? <StarIcon /> : <StarBorderIcon />}
      </IconButton>
      <Typography sx={{ fontSize: '14px', color: '#666' }}>{favoriteCount}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={onComment} sx={{ color: '#666' }}>
        <ChatBubbleOutlineIcon />
      </IconButton>
      <Typography sx={{ fontSize: '14px', color: '#666' }}>{commentCount}</Typography>
    </Box>
  </Box>
);

export default NoteActions;
