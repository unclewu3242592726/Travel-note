import React ,{useEffect} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider,message } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import './App.css';
import 'antd/dist/reset.css'; // v5+
// Layouts
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import NoteList from './pages/notes/NoteList';
import PendingNotes from './pages/notes/PendingNotes';
import RejectedNotes from './pages/notes/RejectedNotes';
import NoteDetail from './pages/notes/NoteDetail';
import UserList from './pages/users/UserList';
import BannedUsers from './pages/users/BannedUsers';
import ReportList from './pages/reports/ReportList';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { setGlobalMessageApi } from './contexts/GlobalMessage';
const App: React.FC = () => {

  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    setGlobalMessageApi(messageApi);
  }, [messageApi]);
  return (
    
    <ConfigProvider locale={zhCN}>
      {contextHolder}
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/notes" element={<NoteList />} />
              <Route path="/notes/pending" element={<PendingNotes />} />
              <Route path="/notes/rejected" element={<RejectedNotes />} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/banned" element={<BannedUsers />} />
              <Route path="/reports" element={<ReportList />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
