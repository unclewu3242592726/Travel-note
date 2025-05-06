import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface MessageContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showMessage = (text: string, type: AlertColor) => {
    setMessage(text);
    setSeverity(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const contextValue: MessageContextType = {
    success: (text: string) => showMessage(text, 'success'),
    error: (text: string) => showMessage(text, 'error'),
    info: (text: string) => showMessage(text, 'info'),
    warning: (text: string) => showMessage(text, 'warning'),
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </MessageContext.Provider>
  );
};

// 创建一个全局 message 对象，兼容 antd 的 message API
const message = {
  success: (text: string) => {
    // 这里会在实际使用时被覆盖
    console.log('Success message:', text);
  },
  error: (text: string) => {
    console.log('Error message:', text);
  },
  info: (text: string) => {
    console.log('Info message:', text);
  },
  warning: (text: string) => {
    console.log('Warning message:', text);
  },
};

export default message;