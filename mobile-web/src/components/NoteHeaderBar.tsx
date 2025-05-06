import React from 'react';
import { Avatar, IconButton, Button, Typography, Box } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

interface NoteHeaderBarProps {
  avatar: string;
  username: string;
  isFollowing: boolean;
  isSelf: boolean;
  onBack: () => void;
  onFollow: () => void;
  onShare: () => void;
}

const NoteHeaderBar: React.FC<NoteHeaderBarProps> = ({
  avatar, username, isFollowing, isSelf, onBack, onFollow, onShare
}) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    p: 2, position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10, borderBottom: '1px solid #f5f5f5'
  }}>
    <Button onClick={onBack} size="small">← 返回</Button>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Avatar src={avatar} sx={{ width: 36, height: 36, mr: 1.5 }} />
      <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>{username}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {!isSelf && (
        <Button variant={isFollowing ? 'outlined' : 'contained'} size="small" onClick={onFollow} sx={{ mr: 1 }}>
          {isFollowing ? '已关注' : '关注'}
        </Button>
      )}
      <IconButton size="small" onClick={onShare}>
        <ShareIcon sx={{ fontSize: '20px', color: '#333' }} />
      </IconButton>
    </Box>
  </Box>
);

export default NoteHeaderBar;
