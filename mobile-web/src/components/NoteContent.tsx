import React from 'react';
import { Box, Typography } from '@mui/material';

interface NoteContentProps {
  title: string;
  content: string;
  location?: string;
  createTime: string;
  tags?: string[];
}

const NoteContent: React.FC<NoteContentProps> = ({ title, content, location, createTime, tags }) => (
  <Box sx={{ px: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
    <Typography variant="body1" sx={{ fontSize: '16px', lineHeight: 1.6, color: '#333', whiteSpace: 'pre-line', wordBreak: 'break-word', mb: 2 }}>{content}</Typography>
    {/* 可扩展：标签、时间、地点等 */}
    <Box sx={{ color: '#999', fontSize: '13px', mb: 2 }}>
      <span>{createTime}</span>
      {location && <span style={{ marginLeft: 12 }}>{location}</span>}
    </Box>
    {/* 可扩展：标签显示 */}
  </Box>
);

export default NoteContent;
