import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const PortfolioOverview: React.FC = () => {
  // Mock data - will be replaced with real API data
  const portfolioStats = {
    totalValue: 1250000000,
    monthlyReturn: 2.5,
    yearToDate: 15.8,
    sharpeRatio: 1.85
  };

  const topHoldings = [
    {
      key: '1',
      company: 'Apple Inc.',
      ticker: 'AAPL',
      value: 125000000,
      weight: 10,
      return: 25.5,
    },
    {
      key: '2',
      company: 'Microsoft Corp.',
      ticker: 'MSFT',
      value: 100000000,
      weight: 8,
      return: 18.3,
    },
    {
      key: '3',
      company: 'Amazon.com Inc.',
      ticker: 'AMZN',
      value: 95000000,
      weight: 7.6,
      return: -5.2,
    },
  ];

  const columns = [
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${(value / 1000000).toFixed(1)}M`,
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${weight}%`,
    },
    {
      title: 'Return',
      dataIndex: 'return',
      key: 'return',
      render: (return_: number) => (
        <span style={{ color: return_ >= 0 ? '#3f8600' : '#cf1322' }}>
          {return_ >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {return_}%
        </span>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Portfolio Value"
              value={portfolioStats.totalValue}
              precision={0}
              formatter={(value: any) => `$${(value / 1000000).toFixed(0)}M`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Monthly Return"
              value={portfolioStats.monthlyReturn}
              precision={2}
              valueStyle={{ color: portfolioStats.monthlyReturn >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={portfolioStats.monthlyReturn >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Year to Date"
              value={portfolioStats.yearToDate}
              precision={2}
              valueStyle={{ color: portfolioStats.yearToDate >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={portfolioStats.yearToDate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sharpe Ratio"
              value={portfolioStats.sharpeRatio}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Top Holdings" style={{ marginTop: 16 }}>
        <Table columns={columns} dataSource={topHoldings} pagination={false} />
      </Card>
    </div>
  );
};

export default PortfolioOverview;
