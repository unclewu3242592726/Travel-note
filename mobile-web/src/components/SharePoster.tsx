import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';

interface SharePosterProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  authorAvatar?: string;
  shareUrl: string;
}

const PosterContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '320px',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const PosterImage = styled('img')({
  width: '100%',
  height: '180px',
  objectFit: 'cover',
});

const PosterAvatar = styled('img')({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '2px solid white',
});

const SharePoster: React.FC<SharePosterProps> = ({
  open,
  onClose,
  title,
  content,
  imageUrl,
  authorName,
  authorAvatar,
  shareUrl
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [posterImage, setPosterImage] = useState<string | null>(null);

  // 当对话框打开时，重置状态
  useEffect(() => {
    if (open) {
      setPosterImage(null);
      setGenerating(false);
    }
  }, [open]);

  // 将内容截断，避免海报内容过长
  const truncateContent = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // 生成海报图片
  const generatePoster = async () => {
    if (!posterRef.current) return;
    
    try {
      setGenerating(true);
      
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      
      const image = canvas.toDataURL('image/png');
      setPosterImage(image);
    } catch (error) {
      console.error('生成海报失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  // 下载海报图片
  const downloadPoster = () => {
    if (!posterImage) return;
    
    const link = document.createElement('a');
    link.download = `${title}-分享海报.png`;
    link.href = posterImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 默认图片
  const defaultImage = 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60';
  const defaultAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          p: 1,
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Typography
        sx={{
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '18px',
          mb: 2
        }}
      >
        分享海报
      </Typography>
      
      <DialogContent sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!posterImage ? (
          <>
            <PosterContainer ref={posterRef}>
              <PosterImage src={imageUrl || defaultImage} alt={title} />
              
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '16px', mb: 1.5 }}>
                  {title}
                </Typography>
                
                <Typography 
                  sx={{ 
                    fontSize: '14px',
                    color: '#666',
                    mb: 2,
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3,
                  }}
                >
                  {truncateContent(content)}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PosterAvatar src={authorAvatar || defaultAvatar} alt={authorName} />
                    <Typography sx={{ ml: 1, fontWeight: 600, fontSize: '14px' }}>
                      {authorName}
                    </Typography>
                  </Box>
                  
                  <QRCodeSVG 
                    value={shareUrl} 
                    size={60} 
                    level="H"
                    includeMargin={false}
                  />
                </Box>
                
                <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 1.5 }}>
                  扫描二维码查看详情
                </Typography>
              </Box>
            </PosterContainer>
            
            <Button 
              variant="contained" 
              fullWidth 
              onClick={generatePoster}
              disabled={generating}
              startIcon={generating ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ 
                mt: 3,
                bgcolor: '#ff2442',
                '&:hover': {
                  bgcolor: '#e01f3d',
                }
              }}
            >
              {generating ? '正在生成...' : '生成海报'}
            </Button>
          </>
        ) : (
          <>
            <img 
              src={posterImage} 
              alt="分享海报" 
              style={{ 
                width: '100%',
                maxWidth: '320px',
                borderRadius: '12px' 
              }} 
            />
            
            <Box sx={{ display: 'flex', width: '100%', mt: 3, justifyContent: 'space-between' }}>
              <Button 
                variant="outlined"
                onClick={() => setPosterImage(null)}
                sx={{ 
                  flex: 1,
                  mr: 1,
                  borderColor: '#999',
                  color: '#666'
                }}
              >
                重新生成
              </Button>
              
              <Button 
                variant="contained"
                onClick={downloadPoster}
                startIcon={<DownloadIcon />}
                sx={{ 
                  flex: 1,
                  ml: 1,
                  bgcolor: '#ff2442',
                  '&:hover': {
                    bgcolor: '#e01f3d',
                  }
                }}
              >
                保存海报
              </Button>
            </Box>
            
            <Typography sx={{ fontSize: '12px', color: '#999', mt: 2, textAlign: 'center' }}>
              提示：长按图片可保存到相册
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SharePoster;