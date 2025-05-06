import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNetwork } from '../contexts/NetworkContext';

interface NetworkStatusIndicatorProps {
  position?: 'top' | 'bottom';
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ position = 'top' }) => {
  const { isOnline, lastNetworkError, clearNetworkError } = useNetwork();
  
  // 如果网络正常，不显示任何内容
  if (isOnline && !lastNetworkError) {
    return null;
  }

  // 刷新页面处理函数
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box 
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        [position]: 0,
        backgroundColor: '#f44336',
        color: 'white',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1300,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <WifiOffIcon sx={{ mr: 1 }} />
        <Typography variant="body2">
          {lastNetworkError || '网络连接不可用，部分功能可能无法正常使用'}
        </Typography>
      </Box>
      <IconButton 
        size="small" 
        color="inherit" 
        onClick={handleRefresh}
        aria-label="刷新"
      >
        <RefreshIcon />
      </IconButton>
    </Box>
  );
};

export default NetworkStatusIndicator;