import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Space, DatePicker, Spin } from 'antd';
import { UserOutlined, FileTextOutlined, EyeOutlined, FlagOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import { Dayjs } from 'dayjs';
import '../styles/Dashboard.css';

const { RangePicker } = DatePicker;

interface StatsData {
  totalUsers: number;
  totalNotes: number;
  totalViews: number;
  totalReports: number;
  pendingNotes: number;
  pendingReports: number;
}

interface DailyStats {
  date: string;
  newUsers: number;
  newNotes: number;
  views: number;
}

interface TopNote {
  key: string;
  id: number;
  title: string;
  author: string;
  views: number;
  likes: number;
  favorites: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [topNotes, setTopNotes] = useState<TopNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real application, we would fetch this data from the backend
        // For this demo, we'll use mock data
        
        // Mock overall stats
        const statsData: StatsData = {
          totalUsers: 1254,
          totalNotes: 3872,
          totalViews: 58961,
          totalReports: 125,
          pendingNotes: 37,
          pendingReports: 12,
        };
        
        // Mock daily stats
        const dailyStatsData: DailyStats[] = [];
        for (let i = 0; i < 7; i++) {
          const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
          dailyStatsData.push({
            date,
            newUsers: Math.floor(Math.random() * 50) + 10,
            newNotes: Math.floor(Math.random() * 100) + 20,
            views: Math.floor(Math.random() * 1000) + 500,
          });
        }
        
        // Mock top notes
        const topNotesData: TopNote[] = [];
        for (let i = 1; i <= 5; i++) {
          topNotesData.push({
            key: i.toString(),
            id: i,
            title: `热门旅游笔记${i}`,
            author: `用户${i}`,
            views: Math.floor(Math.random() * 1000) + 500,
            likes: Math.floor(Math.random() * 200) + 100,
            favorites: Math.floor(Math.random() * 100) + 50,
          });
        }
        
        // Set state
        setStats(statsData);
        setDailyStats(dailyStatsData.reverse());
        setTopNotes(topNotesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Chart options for daily stats
  const getDailyStatsOptions = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['新用户', '新笔记', '访问量'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dailyStats.map(item => item.date),
      },
      yAxis: [
        {
          type: 'value',
          name: '数量',
        },
        {
          type: 'value',
          name: '访问量',
        },
      ],
      series: [
        {
          name: '新用户',
          type: 'bar',
          data: dailyStats.map(item => item.newUsers),
        },
        {
          name: '新笔记',
          type: 'bar',
          data: dailyStats.map(item => item.newNotes),
        },
        {
          name: '访问量',
          type: 'line',
          yAxisIndex: 1,
          data: dailyStats.map(item => item.views),
        },
      ],
    };
  };

  // Column definitions for top notes table
  const topNotesColumns = [
    {
      title: '排名',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: '笔记标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      sorter: (a: TopNote, b: TopNote) => a.views - b.views,
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      sorter: (a: TopNote, b: TopNote) => a.likes - b.likes,
    },
    {
      title: '收藏数',
      dataIndex: 'favorites',
      key: 'favorites',
      sorter: (a: TopNote, b: TopNote) => a.favorites - b.favorites,
    },
  ];

  // Handle date range change
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
    setDateRange(dates || [null, null]);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>仪表盘</h2>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            allowClear={false}
          />
        </Space>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={12} md={6}>
              <Card>
                <Statistic
                  title="总用户数"
                  value={stats?.totalUsers}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card>
                <Statistic
                  title="总笔记数"
                  value={stats?.totalNotes}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card>
                <Statistic
                  title="总浏览量"
                  value={stats?.totalViews}
                  prefix={<EyeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card>
                <Statistic
                  title="总举报数"
                  value={stats?.totalReports}
                  prefix={<FlagOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Pending counts */}
          <Row gutter={[16, 16]} className="margin-top">
            <Col xs={24} sm={12}>
              <Card title="待处理">
                <Statistic
                  title="待审核笔记"
                  value={stats?.pendingNotes}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="待处理">
                <Statistic
                  title="待处理举报"
                  value={stats?.pendingReports}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Daily stats chart */}
          <Row gutter={[16, 16]} className="margin-top">
            <Col span={24}>
              <Card title="每日统计" className="chart-card">
                <ReactECharts option={getDailyStatsOptions()} style={{ height: 300 }} />
              </Card>
            </Col>
          </Row>

          {/* Top notes table */}
          <Row gutter={[16, 16]} className="margin-top">
            <Col span={24}>
              <Card title="热门笔记排行">
                <Table
                  columns={topNotesColumns}
                  dataSource={topNotes}
                  pagination={false}
                  size="middle"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;