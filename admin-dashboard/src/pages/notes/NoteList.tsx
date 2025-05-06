import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Input } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/NotesPage.css';

const { Search } = Input;

interface NoteData {
  id: number;
  title: string;
  content: string;
  coverUrl: string;
  userId: number;
  username: string;
  createTime: string;
  status: number; // 0-pending, 1-approved, 2-rejected
}

const NoteList: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const pageSize = 10;

  // Fetch approved notes
  const fetchNotes = async (page: number, query: string = '') => {
    try {
      setLoading(true);

      // Mock data for demonstration
      const mockNotes: NoteData[] = [];
      for (let i = 1; i <= 50; i++) {
        mockNotes.push({
          id: i,
          title: `已通过旅游笔记 ${i}`,
          content: `这是一篇已通过的旅游笔记内容，描述了精彩的旅游体验...`,
          coverUrl: 'https://via.placeholder.com/300x200?text=Approved+Note',
          userId: 100 + i,
          username: `用户${100 + i}`,
          createTime: new Date(Date.now() - i * 86400000).toISOString(),
          status: 1, // approved
        });
      }

      // Filter by query if provided
      const filteredNotes = query
        ? mockNotes.filter(note => 
            note.title.includes(query) || 
            note.content.includes(query) ||
            note.username.includes(query)
          )
        : mockNotes;

      // Paginate
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedNotes = filteredNotes.slice(start, end);

      setNotes(paginatedNotes);
      setTotalItems(filteredNotes.length);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notes on initial render and when search/page changes
  useEffect(() => {
    fetchNotes(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle note detail view
  const handleViewNote = (note: NoteData) => {
    navigate(`/notes/${note.id}`);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Column definitions
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: NoteData) => (
        <button
          type="button"
          className="note-link-btn"
          onClick={() => handleViewNote(record)}
          style={{ background: 'none', border: 'none', color: '#1890ff', cursor: 'pointer', padding: 0 }}
        >
          {text}
        </button>
      ),
    },
    {
      title: '作者',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="green">已通过</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: NoteData) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewNote(record)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="notes-page-container">
      <div className="page-header">
        <h2>已通过笔记</h2>
        <Search
          placeholder="搜索笔记标题、内容或作者"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={notes}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: totalItems,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
        }}
      />
    </div>
  );
};

export default NoteList;