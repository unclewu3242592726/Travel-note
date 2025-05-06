import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Masonry from '@mui/lab/Masonry';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import axios from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { getFullMediaUrl } from '../utils/media';
import { HOME_REFRESH_EVENT } from '../layouts/MainLayout';
import NoteCard, { Note } from '../components/NoteCard';

const SearchBox = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  background: '#fff',
  borderRadius: 24,
  padding: '2px 12px',
  margin: '16px 0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
}));

const pageSize = 15;

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  // 用于自动加载的引用
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const fetchNotes = async (page: number, searchVal: string = '', isReset: boolean = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/notes`, {
        params: {
          page,
          size: pageSize,
          search: searchVal,
        },
      });
      const rawNotes = response.data.data.content;
      // 批量处理coverUrl为可访问的URL
      const notesWithCovers = await Promise.all(
        rawNotes.map(async (note: Note) => ({
          ...note,
          coverUrl: await getFullMediaUrl(note.coverUrl)
        }))
      );
      
      // 如果是重置，则替换笔记列表，否则追加
      if (isReset) {
        setNotes(notesWithCovers);
      } else {
        setNotes(prev => [...prev, ...notesWithCovers]);
      }
      
      setTotalItems(response.data.data.totalElements);
      setHasMore(page * pageSize < response.data.data.totalElements);
    } catch (error) {
      if (isReset) {
        setNotes([]);
      }
      // 在请求失败时设置hasMore为false，防止无限重试
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 重置并获取数据的函数
  const resetAndFetchNotes = useCallback(() => {
    setCurrentPage(1);
    fetchNotes(1, search, true);
  }, [search]);

  // 加载更多数据
  const loadMoreNotes = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchNotes(nextPage, search);
    }
  }, [currentPage, loading, hasMore, search]);

  // 设置交叉观察器以实现自动加载
  useEffect(() => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreNotes();
      }
    };
    
    observer.current = new IntersectionObserver(callback, {
      rootMargin: '200px', // 提前200px触发
    });
    
    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMoreNotes]);

  // 添加对Home刷新事件的监听
  useEffect(() => {
    // 监听自定义刷新事件
    const handleRefreshEvent = () => {
      resetAndFetchNotes();
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    window.addEventListener(HOME_REFRESH_EVENT, handleRefreshEvent);
    
    return () => {
      window.removeEventListener(HOME_REFRESH_EVENT, handleRefreshEvent);
    };
  }, [resetAndFetchNotes]);

  // 监听路由变化，如果是主页则刷新数据
  useEffect(() => {
    if (location.pathname === '/') {
      resetAndFetchNotes();
    }
  }, [location.pathname, resetAndFetchNotes]);

  // 初始化或搜索变化时重置并获取数据
  useEffect(() => {
    resetAndFetchNotes();
    // eslint-disable-next-line
  }, [search]);

  const handleNoteClick = (id: number) => {
    navigate(`/notes/${id}`);
  };

  const handleLike = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      return;
    }
    try {
      const response = await axios.post(`/api/notes/${id}/like`);
      if (response.data.code === 200) {
        setNotes(notes.map(note =>
          note.id === id ? {
            ...note,
            isLiked: !note.isLiked,
            likeCount: note.isLiked ? note.likeCount - 1 : note.likeCount + 1
          } : note
        ));
      }
    } catch {}
  };

  const handleFavorite = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      return;
    }
    try {
      const response = await axios.post(`/api/notes/${id}/favorite`);
      if (response.data.code === 200) {
        setNotes(notes.map(note =>
          note.id === id ? {
            ...note,
            isFavorited: !note.isFavorited,
            favoriteCount: note.isFavorited ? note.favoriteCount - 1 : note.favoriteCount + 1
          } : note
        ));
      }
    } catch {}
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    // @ts-ignore
    setSearch(e.target.search.value.trim());
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', pt: 2 }}>
      <form onSubmit={handleSearch}>
        <SearchBox>
          <SearchIcon sx={{ color: '#888', mr: 1 }} />
          <InputBase
            name="search"
            placeholder="搜索游记标题或作者昵称"
            sx={{ flex: 1, fontSize: 16 }}
            defaultValue={search}
            autoComplete="off"
          />
          <Button type="submit" variant="contained" size="small" sx={{ ml: 1, borderRadius: 12 }}>搜索</Button>
        </SearchBox>
      </form>
      {loading && notes.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notes.length === 0 ? (
        <Box sx={{ textAlign: 'center', color: '#888', py: 8 }}>暂无笔记</Box>
      ) : (
        <Masonry columns={{ xs: 2, sm: 2 }} spacing={1}>
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onNoteClick={handleNoteClick}
              onLike={handleLike}
              onFavorite={handleFavorite}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </Masonry>
      )}
      
      {/* 自动加载更多的触发区域 */}
      <Box ref={loadingRef} sx={{ textAlign: 'center', my: 4, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading && notes.length > 0 ? (
          <CircularProgress size={30} />
        ) : hasMore ? (
          <Typography variant="body2" color="text.secondary">向下滚动加载更多</Typography>
        ) : notes.length > 0 ? (
          <Typography variant="body2" color="text.secondary">已经到底了~</Typography>
        ) : null}
      </Box>
    </Box>
  );
};

export default Home;