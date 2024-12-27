import React, { useState } from 'react';
import { Card, Row, Col, Table, Select, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { Option } = Select;

const HoldingsAnalysis: React.FC = () => {
  const [sectorView, setSectorView] = useState<'allocation' | 'performance'>('allocation');
  
  // Mock data - will be replaced with API data
  const holdingsData = [
    {
      key: '1',
      company: 'Apple Inc.',
      ticker: 'AAPL',
      sector: 'Technology',
      value: 125000000,
      weight: 10,
      costBasis: 135.50,
      currentPrice: 170.25,
      return: 25.5,
      shares: 735000,
    },
    {
      key: '2',
      company: 'Microsoft Corp.',
      ticker: 'MSFT',
      sector: 'Technology',
      value: 100000000,
      weight: 8,
      costBasis: 220.75,
      currentPrice: 265.80,
      return: 18.3,
      shares: 376000,
    },
    {
      key: '3',
      company: 'JPMorgan Chase',
      ticker: 'JPM',
      sector: 'Financials',
      value: 85000000,
      weight: 6.8,
      costBasis: 140.25,
      currentPrice: 155.40,
      return: 10.8,
      shares: 547000,
    },
  ];

  const sectorAllocation = {
    Technology: 35.5,
    Financials: 20.3,
    Healthcare: 15.8,
    ConsumerDiscretionary: 12.4,
    Industrials: 8.7,
    Others: 7.3,
  };

  const sectorPerformance = {
    Technology: 22.5,
    Financials: 15.3,
    Healthcare: 8.8,
    ConsumerDiscretionary: -5.4,
    Industrials: 12.7,
    Others: 3.3,
  };

  const columns = [
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      sorter: (a: any, b: any) => a.company.localeCompare(b.company),
    },
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      filters: [
        { text: 'Technology', value: 'Technology' },
        { text: 'Financials', value: 'Financials' },
      ],
      onFilter: (value: string, record: any) => record.sector === value,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      sorter: (a: any, b: any) => a.value - b.value,
      render: (value: number) => `$${(value / 1000000).toFixed(1)}M`,
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      sorter: (a: any, b: any) => a.weight - b.weight,
      render: (weight: number) => `${weight}%`,
    },
    {
      title: 'Return',
      dataIndex: 'return',
      key: 'return',
      sorter: (a: any, b: any) => a.return - b.return,
      render: (return_: number) => (
        <span style={{ color: return_ >= 0 ? '#3f8600' : '#cf1322' }}>
          {return_}%
        </span>
      ),
    },
  ];

  const getPieChartOption = () => {
    const data = Object.entries(sectorView === 'allocation' ? sectorAllocation : sectorPerformance)
      .map(([name, value]) => ({ name, value }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          name: sectorView === 'allocation' ? 'Allocation' : 'Performance',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Holdings Details" extra={
            <Space>
              <Tooltip title="Click column headers to sort">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }>
            <Table 
              columns={columns} 
              dataSource={holdingsData} 
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Sector Analysis" extra={
            <Select 
              defaultValue="allocation" 
              onChange={(value: 'allocation' | 'performance') => setSectorView(value)}
            >
              <Option value="allocation">Allocation</Option>
              <Option value="performance">Performance</Option>
            </Select>
          }>
            <ReactECharts 
              option={getPieChartOption()} 
              style={{ height: '400px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HoldingsAnalysis;
