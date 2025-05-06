import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Input } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/NotesPage.css';

const { Search } = Input;

interface ReportData {
  id: number;
  noteId: number;
  noteTitle: string;
  reporter: string;
  reason: string;
  createTime: string;
  status: number; // 0-未处理, 1-已处理
}

const ReportList: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const pageSize = 10;

  // 获取举报列表
  const fetchReports = async (page: number, query: string = '') => {
    setLoading(true);
    // 模拟数据
    const mockReports: ReportData[] = [];
    for (let i = 1; i <= 25; i++) {
      mockReports.push({
        id: i,
        noteId: 100 + i,
        noteTitle: `被举报笔记${100 + i}`,
        reporter: `用户${200 + i}`,
        reason: i % 2 === 0 ? '涉嫌违规内容' : '垃圾广告',
        createTime: new Date(Date.now() - i * 3600000).toISOString(),
        status: i % 2 === 0 ? 0 : 1,
      });
    }
    const filtered = query
      ? mockReports.filter(r =>
          r.noteTitle.includes(query) ||
          r.reporter.includes(query) ||
          r.reason.includes(query)
        )
      : mockReports;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setReports(filtered.slice(start, end));
    setTotalItems(filtered.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleViewNote = (report: ReportData) => {
    navigate(`/notes/${report.noteId}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '被举报笔记',
      dataIndex: 'noteTitle',
      key: 'noteTitle',
      render: (text: string, record: ReportData) => (
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
      title: '举报人',
      dataIndex: 'reporter',
      key: 'reporter',
    },
    {
      title: '举报原因',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '举报时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: ReportData) => (
        record.status === 0 ? <Tag color="orange">未处理</Tag> : <Tag color="green">已处理</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ReportData) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewNote(record)}
          >
            查看笔记
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="notes-page-container">
      <div className="page-header">
        <h2>举报列表</h2>
        <Search
          placeholder="搜索笔记标题、举报人或原因"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={reports}
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

export default ReportList;