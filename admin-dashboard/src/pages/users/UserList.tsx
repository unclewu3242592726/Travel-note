import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Input, Popconfirm } from 'antd';
import { SearchOutlined, StopOutlined } from '@ant-design/icons';
import '../../styles/NotesPage.css';
import { globalMessage } from '../../contexts/GlobalMessage';
const { Search } = Input;

interface UserData {
  id: number;
  username: string;
  email: string;
  mobile: string;
  createTime: string;
  status: number; // 0-normal, 1-banned
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const pageSize = 10;

  // 获取正常用户
  const fetchUsers = async (page: number, query: string = '') => {
    setLoading(true);
    // 模拟数据
    const mockUsers: UserData[] = [];
    for (let i = 1; i <= 30; i++) {
      mockUsers.push({
        id: i,
        username: `user${i}`,
        email: `user${i}@mail.com`,
        mobile: `139000000${i.toString().padStart(2, '0')}`,
        createTime: new Date(Date.now() - i * 86400000).toISOString(),
        status: 0,
      });
    }
    const filtered = query
      ? mockUsers.filter(u =>
          u.username.includes(query) ||
          u.email.includes(query) ||
          u.mobile.includes(query)
        )
      : mockUsers;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setUsers(filtered.slice(start, end));
    setTotalItems(filtered.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // 封禁操作
  const handleBan = (user: UserData) => {
    // 这里应调用后端接口，演示直接本地处理
    setUsers(prev => prev.filter(u => u.id !== user.id));
    globalMessage.success(`已封禁用户：${user.username}`);
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="green">正常</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserData) => (
        <Space size="middle">
          <Popconfirm
            title="确定要封禁该用户吗？"
            onConfirm={() => handleBan(record)}
            okText="封禁"
            cancelText="取消"
          >
            <Button icon={<StopOutlined />} size="small" type="primary" danger>
              封禁
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="notes-page-container">
      <div className="page-header">
        <h2>正常用户</h2>
        <Search
          placeholder="搜索用户名、邮箱或手机号"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={users}
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

export default UserList;