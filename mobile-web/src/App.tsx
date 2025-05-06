import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Capacitor核心插件
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { getPlatform, isAndroid, isMobile } from './utils/platform';

// 自定义消息提示组件
import { MessageProvider } from './utils/message';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import NoteDetail from './pages/NoteDetail';
import NoteCreate from './pages/NoteCreate';
import NoteEdit from './pages/NoteEdit';
import MyFavorites from './pages/MyFavorites';
import MyNotes from './pages/MyNotes';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkContext';

// 创建 MUI 主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  // 处理移动平台的初始化逻辑
  useEffect(() => {
    const initApp = async () => {
      if (isMobile()) {
        console.log(`运行平台: ${getPlatform()}`);
        
        // 隐藏启动页
        await SplashScreen.hide();
        
        try {
          if (isAndroid()) {
            // Android平台特定处理
            StatusBar.setStyle({ style: Style.Light });
            StatusBar.setBackgroundColor({ color: '#ffffff' });
          } else {
            // iOS平台特定处理
            StatusBar.setStyle({ style: Style.Light });
          }
        } catch (error) {
          console.error('设置状态栏失败', error);
        }
      }
    };
    
    initApp();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MessageProvider>
        <NetworkProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Main routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notes/:id" element={<NoteDetail />} />
                  <Route path="/notes/create" element={<NoteCreate />} />
                  <Route path="/notes/edit/:id" element={<NoteEdit />} />
                  <Route path="/my/favorites" element={<MyFavorites />} />
                  <Route path="/my/notes" element={<MyNotes />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </NetworkProvider>
      </MessageProvider>
    </ThemeProvider>
  );
};

export default App;
