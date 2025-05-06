import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import QrCodeIcon from '@mui/icons-material/QrCode';
// 导入Capacitor Share插件
import { Share } from '@capacitor/share';
import { isMobile } from '../utils/platform';

// 微信、微博、QQ图标可以从这些平台的官方资源获取，这里使用示例URLs
const wechatLogo = 'https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico';
const weiboLogo = 'https://weibo.com/favicon.ico';
const qqLogo = 'https://im.qq.com/favicon.ico';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  imageUrl?: string;
  shareUrl: string;
}

const ShareItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'all 0.3s',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  }
}));

const ShareIcon2 = styled('img')({
  width: '40px',
  height: '40px',
  marginBottom: '8px',
  borderRadius: '8px'
});

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  title,
  content,
  imageUrl,
  shareUrl
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [posterDialogOpen, setPosterDialogOpen] = useState(false);

  const handleShareToWechat = async () => {
    // 在移动端，使用Capacitor Share插件
    if (isMobile()) {
      try {
        await Share.share({
          title: title,
          text: content,
          url: shareUrl,
          dialogTitle: '分享到微信'
        });
        showSnackbar('分享成功', 'success');
      } catch (error) {
        showSnackbar('分享失败，请手动分享', 'error');
      }
    } else {
      // 在Web环境，使用Web Share API或提示用户
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: content,
            url: shareUrl,
          });
          showSnackbar('分享成功', 'success');
        } catch (error) {
          showSnackbar('分享失败: ' + error, 'error');
        }
      } else {
        showSnackbar('请打开微信扫一扫，扫描二维码分享', 'success');
      }
    }
  };

  const handleShareToWeibo = async () => {
    if (isMobile()) {
      try {
        await Share.share({
          title: title,
          text: content,
          url: shareUrl,
          dialogTitle: '分享到微博'
        });
        showSnackbar('分享成功', 'success');
      } catch (error) {
        // 如果原生分享失败，尝试打开微博网页
        const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        window.open(weiboUrl, '_blank');
        showSnackbar('正在打开微博分享页面', 'success');
      }
    } else {
      // Web环境下直接使用链接分享
      const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
      window.open(weiboUrl, '_blank');
      showSnackbar('正在打开微博分享页面', 'success');
    }
  };

  const handleShareToQQ = async () => {
    if (isMobile()) {
      try {
        await Share.share({
          title: title,
          text: content,
          url: shareUrl,
          dialogTitle: '分享到QQ'
        });
        showSnackbar('分享成功', 'success');
      } catch (error) {
        // 如果原生分享失败，尝试打开QQ网页
        const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(content)}`;
        window.open(qqUrl, '_blank');
        showSnackbar('正在打开QQ分享页面', 'success');
      }
    } else {
      // Web环境下直接使用链接分享
      const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(content)}`;
      window.open(qqUrl, '_blank');
      showSnackbar('正在打开QQ分享页面', 'success');
    }
  };

  const handleCopyLink = () => {
    // 复制链接到剪贴板
    navigator.clipboard.writeText(shareUrl).then(() => {
      showSnackbar('链接已复制到剪贴板', 'success');
    }).catch(() => {
      showSnackbar('复制失败，请手动复制', 'error');
    });
  };

  const handleGenerateSharePoster = () => {
    // 显示生成海报的对话框
    setPosterDialogOpen(true);
    onClose(); // 关闭当前对话框
  };

  const handleNativeShare = async () => {
    // 使用原生分享功能
    if (isMobile()) {
      try {
        await Share.share({
          title: title,
          text: content,
          url: shareUrl,
          dialogTitle: '分享'
        });
        showSnackbar('分享成功', 'success');
      } catch (error) {
        showSnackbar('分享失败: ' + error, 'error');
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content,
          url: shareUrl,
        });
        showSnackbar('分享成功', 'success');
      } catch (error) {
        showSnackbar('分享失败: ' + error, 'error');
      }
    } else {
      showSnackbar('您的浏览器不支持原生分享功能', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
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
          分享笔记
        </Typography>
        
        <DialogContent sx={{ p: 1 }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid size={{ xs: 3 }}>
              <ShareItem onClick={handleShareToWechat}>
                <ShareIcon2 src={wechatLogo} alt="微信" />
                <Typography variant="caption">微信</Typography>
              </ShareItem>
            </Grid>
            
            <Grid size={{ xs: 3 }}>
              <ShareItem onClick={handleShareToWeibo}>
                <ShareIcon2 src={weiboLogo} alt="微博" />
                <Typography variant="caption">微博</Typography>
              </ShareItem>
            </Grid>
            
            <Grid size={{ xs: 3 }}>
              <ShareItem onClick={handleShareToQQ}>
                <ShareIcon2 src={qqLogo} alt="QQ" />
                <Typography variant="caption">QQ</Typography>
              </ShareItem>
            </Grid>
            
            <Grid size={{ xs: 3 }}>
              <ShareItem onClick={handleNativeShare}>
                <Box sx={{ 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  mb: 1
                }}>
                  <ShareIcon sx={{ color: '#666' }} />
                </Box>
                <Typography variant="caption">更多</Typography>
              </ShareItem>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2} justifyContent="center">
            <Grid size={{ xs: 4 }}>
              <ShareItem onClick={handleCopyLink}>
                <Box sx={{ 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  mb: 1
                }}>
                  <ContentCopyIcon sx={{ color: '#666' }} />
                </Box>
                <Typography variant="caption">复制链接</Typography>
              </ShareItem>
            </Grid>
            
            <Grid size={{ xs: 4 }}>
              <ShareItem onClick={handleGenerateSharePoster}>
                <Box sx={{ 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  mb: 1
                }}>
                  <QrCodeIcon sx={{ color: '#666' }} />
                </Box>
                <Typography variant="caption">生成海报</Typography>
              </ShareItem>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareDialog;