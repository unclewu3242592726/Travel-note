import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Modal, Input, Typography } from 'antd';
import { CheckOutlined, CloseOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/NotesPage.css';
import { globalMessage } from '../../contexts/GlobalMessage';
const { Text, Paragraph } = Typography;
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

const API_URL = 'http://localhost:8080/api/admin';

const PendingNotes: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNote, setSelectedNote] = useState<NoteData | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectModalVisible, setRejectModalVisible] = useState<boolean>(false);
  const pageSize = 10;

  // Fetch pending notes
  const fetchNotes = async (page: number, query: string = '') => {
    try {
      setLoading(true);
      
      // In a real application, we would fetch data from the backend
      // For this demo, we'll use mock data
      const mockNotes: NoteData[] = [];
      for (let i = 1; i <= 20; i++) {
        mockNotes.push({
          id: i,
          title: `待审核旅游笔记 ${i}`,
          content: `这是一篇待审核的旅游笔记内容，描述了精彩的旅游体验...`,
          coverUrl: 'https://via.placeholder.com/300x200?text=Pending+Note',
          userId: 100 + i,
          username: `用户${100 + i}`,
          createTime: new Date(Date.now() - i * 86400000).toISOString(),
          status: 0, // pending
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
      console.error('Failed to fetch pending notes:', error);
      globalMessage.error('获取待审核笔记失败');
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

  // Handle note approval
  const handleApproveNote = async (note: NoteData) => {
    try {
      // In a real application, we would call the API to approve the note
      // For this demo, we'll just show a success message
      
      globalMessage.success(`笔记 "${note.title}" 已审核通过`);
      
      // Refresh the notes list
      fetchNotes(currentPage, searchQuery);
    } catch (error) {
      console.error('Failed to approve note:', error);
      globalMessage.error('审核操作失败');
    }
  };

  // Handle note rejection (open modal)
  const handleRejectNoteClick = (note: NoteData) => {
    setSelectedNote(note);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // Handle note rejection (submit)
  const handleRejectNote = async () => {
    if (!selectedNote) return;
    
    try {
      // In a real application, we would call the API to reject the note
      // For this demo, we'll just show a success message
      
      globalMessage.success(`笔记 "${selectedNote.title}" 已拒绝`);
      
      // Close modal and refresh the notes list
      setRejectModalVisible(false);
      fetchNotes(currentPage, searchQuery);
    } catch (error) {
      console.error('Failed to reject note:', error);
      globalMessage.error('拒绝操作失败');
    }
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
        <a onClick={() => handleViewNote(record)}>{text}</a>
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
      render: () => <Tag color="blue">待审核</Tag>,
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
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            onClick={() => handleApproveNote(record)}
          >
            通过
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => handleRejectNoteClick(record)}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="notes-page-container">
      <div className="page-header">
        <h2>待审核笔记</h2>
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

      {/* Reject Modal */}
      <Modal
        title="拒绝笔记"
        open={rejectModalVisible}
        onOk={handleRejectNote}
        onCancel={() => setRejectModalVisible(false)}
        okText="确认拒绝"
        cancelText="取消"
      >
        <Paragraph>
          您正在拒绝笔记 <Text strong>{selectedNote?.title}</Text>
        </Paragraph>
        <Input.TextArea
          rows={4}
          placeholder="请输入拒绝原因（将通知给用户）"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PendingNotes; 