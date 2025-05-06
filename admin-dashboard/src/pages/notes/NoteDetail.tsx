import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Tag, Button, Descriptions } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import '../../styles/NotesPage.css';

interface NoteDetailData {
  id: number;
  title: string;
  content: string;
  coverUrl: string;
  userId: number;
  username: string;
  createTime: string;
  status: number; // 0-pending, 1-approved, 2-rejected
}

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '待审核' },
  1: { color: 'green', text: '已通过' },
  2: { color: 'red', text: '已拒绝' },
};

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<NoteDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 模拟获取笔记详情
    setLoading(true);
    setTimeout(() => {
      // 假数据
      setNote({
        id: Number(id),
        title: `旅游笔记 ${id}`,
        content: `这里是旅游笔记 ${id} 的详细内容，描述了丰富的旅游体验和见闻。`,
        coverUrl: 'https://via.placeholder.com/600x300?text=Note+Cover',
        userId: 100 + Number(id),
        username: `用户${100 + Number(id)}`,
        createTime: new Date(Date.now() - Number(id) * 86400000).toISOString(),
        status: 1,
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="note-detail-spin">
        <Spin size="large" />
      </div>
    );
  }

  if (!note) {
    return <div style={{ padding: 24 }}>未找到该笔记。</div>;
  }

  return (
    <div className="note-detail-container">
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 16 }}>
        返回
      </Button>
      <Card
        title={note.title}
        extra={<Tag color={statusMap[note.status].color}>{statusMap[note.status].text}</Tag>}
        cover={<img alt="cover" src={note.coverUrl} style={{ maxHeight: 300, objectFit: 'cover' }} />}
        bordered={false}
      >
        <Descriptions column={1} size="middle">
          <Descriptions.Item label="作者">{note.username}</Descriptions.Item>
          <Descriptions.Item label="提交时间">{new Date(note.createTime).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="内容">
            <div style={{ whiteSpace: 'pre-line' }}>{note.content}</div>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default NoteDetail;