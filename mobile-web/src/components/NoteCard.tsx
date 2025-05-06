import React from 'react';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// 导出 Note 接口以便其他组件使用
export interface Note {
  id: number;
  title: string;
  content: string;
  coverUrl: string;
  location: string;
  userId: number;
  username: string;
  userAvatar: string;
  createTime: string;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
}

// 组件 Props 定义
interface NoteCardProps {
  note: Note;
  onNoteClick: (id: number) => void;
  onLike: (e: React.MouseEvent, id: number) => void;
  onFavorite: (e: React.MouseEvent, id: number) => void;
  isAuthenticated: boolean;
}

// 样式组件
const StyledCard = styled(Paper)(({ theme }) => ({
  padding: 0,
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  }
}));

const NoteCover = styled('div')({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    display: 'block',
    objectFit: 'cover',
    minHeight: 120,
    maxHeight: 220,
    transition: 'transform 0.3s ease',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  }
});

const NoteLocation = styled('div')({
  position: 'absolute',
  left: 8,
  bottom: 8,
  background: 'rgba(0,0,0,0.5)',
  color: '#fff',
  fontSize: 12,
  padding: '3px 8px',
  borderRadius: 8,
  backdropFilter: 'blur(4px)',
  maxWidth: 'calc(100% - 16px)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const NoteContent = styled('div')({
  padding: '12px 12px 8px 12px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const NoteStats = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 12px 12px 12px',
  fontSize: 13,
  color: '#888',
});

const NoteAuthor = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: '#555',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const ContentText = styled(Typography)({
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: '1.5em',
  maxHeight: '3em',  // 2行文字高度
});

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onNoteClick, 
  onLike, 
  onFavorite, 
  isAuthenticated 
}) => {
  // 格式化数字，超过1000显示为 1k+，超过10000显示为 10w+
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${Math.floor(num / 10000)}w+`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}k+`;
    }
    return num.toString();
  };

  return (
    <StyledCard onClick={() => onNoteClick(note.id)}>
      <NoteCover>
        <img alt={note.title} src={note.coverUrl || '/noImage.png'} />
        <NoteLocation title={note.location}>{note.location}</NoteLocation>
      </NoteCover>
      <NoteContent>
        <Tooltip title={note.title} placement="top" arrow>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom 
            sx={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              fontSize: '1rem',
              lineHeight: 1.4
            }}>
            {note.title}
          </Typography>
        </Tooltip>
        <Tooltip title={note.content} placement="top" arrow>
          <ContentText variant="body2" color="text.secondary">
            {note.content}
          </ContentText>
        </Tooltip>
        <Tooltip title={`作者: ${note.username}`} placement="top" arrow>
          <NoteAuthor>
            <Avatar src={note.userAvatar} sx={{ width: 24, height: 24 }} />
            <span>{note.username}</span>
          </NoteAuthor>
        </Tooltip>
      </NoteContent>
      <NoteStats>
        <Tooltip title={`${note.viewCount} 次浏览`} arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VisibilityOutlinedIcon fontSize="small" />
            {formatNumber(note.viewCount)}
          </Box>
        </Tooltip>
        <IconButton size="small" onClick={e => onLike(e, note.id)}>
          {note.isLiked ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
        <Tooltip title={`${note.likeCount} 次点赞`} arrow>
          <span>{formatNumber(note.likeCount)}</span>
        </Tooltip>
        <IconButton size="small" onClick={e => onFavorite(e, note.id)}>
          {note.isFavorited ? <StarIcon color="warning" fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </IconButton>
        <Tooltip title={`${note.favoriteCount} 次收藏`} arrow>
          <span>{formatNumber(note.favoriteCount)}</span>
        </Tooltip>
        <Tooltip title={`${note.commentCount} 条评论`} arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CommentOutlinedIcon fontSize="small" />
            {formatNumber(note.commentCount)}
          </Box>
        </Tooltip>
      </NoteStats>
    </StyledCard>
  );
};

export default NoteCard;