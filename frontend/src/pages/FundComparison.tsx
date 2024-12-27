import React, { useState } from 'react';
import { Card, Row, Col, Select, Table, Space } from 'antd';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import LineChart from 'echarts/charts';
import {
  DatasetComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import {
  CanvasRenderer,
  useECTheme,
} from 'echarts/renderers';
import moment from 'moment';

const { Option } = Select;

const FundComparison: React.FC = () => {
  const [selectedFunds, setSelectedFunds] = useState(['fund1', 'fund2']);
  const [timeRange, setTimeRange] = useState('1y');

  // Mock funds data
  const fundsData = {
    fund1: {
      name: 'Global Macro Fund',
      returns: {
        ytd: 15.8,
        '1y': 22.5,
        '3y': 45.8,
        '5y': 85.4,
      },
      metrics: {
        alpha: 3.2,
        beta: 0.85,
        sharpeRatio: 1.85,
        sortino: 2.1,
        maxDrawdown: -12.5,
        volatility: 14.2,
      },
    },
    fund2: {
      name: 'Long/Short Equity',
      returns: {
        ytd: 12.4,
        '1y': 18.7,
        '3y': 38.5,
        '5y': 72.3,
      },
      metrics: {
        alpha: 2.8,
        beta: 0.92,
        sharpeRatio: 1.65,
        sortino: 1.9,
        maxDrawdown: -15.8,
        volatility: 15.8,
      },
    },
    fund3: {
      name: 'Event Driven',
      returns: {
        ytd: 10.2,
        '1y': 16.5,
        '3y': 35.2,
        '5y': 65.8,
      },
      metrics: {
        alpha: 2.5,
        beta: 0.78,
        sharpeRatio: 1.55,
        sortino: 1.8,
        maxDrawdown: -13.2,
        volatility: 13.5,
      },
    },
  };

  // Generate comparison table data
  const getComparisonData = () => {
    return selectedFunds.map(fundId => ({
      key: fundId,
      fund: fundsData[fundId as keyof typeof fundsData].name,
      ...fundsData[fundId as keyof typeof fundsData].returns,
      ...fundsData[fundId as keyof typeof fundsData].metrics,
    }));
  };

  const columns = [
    {
      title: 'Fund',
      dataIndex: 'fund',
      key: 'fund',
    },
    {
      title: 'YTD Return',
      dataIndex: 'ytd',
      key: 'ytd',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => a.ytd - b.ytd,
    },
    {
      title: '1Y Return',
      dataIndex: '1y',
      key: '1y',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => a['1y'] - b['1y'],
    },
    {
      title: 'Alpha',
      dataIndex: 'alpha',
      key: 'alpha',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => a.alpha - b.alpha,
    },
    {
      title: 'Beta',
      dataIndex: 'beta',
      key: 'beta',
      sorter: (a: any, b: any) => a.beta - b.beta,
    },
    {
      title: 'Sharpe',
      dataIndex: 'sharpeRatio',
      key: 'sharpeRatio',
      sorter: (a: any, b: any) => a.sharpeRatio - b.sharpeRatio,
    },
    {
      title: 'Max Drawdown',
      dataIndex: 'maxDrawdown',
      key: 'maxDrawdown',
      render: (value: number) => `${value}%`,
      sorter: (a: any, b: any) => a.maxDrawdown - b.maxDrawdown,
    },
  ];

  // Generate performance comparison chart
  const getPerformanceChartOption = () => {
    const dates = [];
    const seriesData: { [key: string]: number[] } = {};
    
    selectedFunds.forEach(fund => {
      seriesData[fund] = [];
    });

    let value = 100;
    for (let i = 0; i < 365; i++) {
      const date = moment().subtract(365 - i, 'days').format('YYYY-MM-DD');
      dates.push(date);

      selectedFunds.forEach(fund => {
        const change = (Math.random() - 0.48) * (fund === 'fund1' ? 2 : fund === 'fund2' ? 1.8 : 1.6);
        value *= (1 + change / 100);
        seriesData[fund].push(value);
        value = 100; // Reset for next fund
      });
    }

    return {
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          return `${params[0].name}: ${params[0].value}`;
        },
      },
      legend: {
        data: ['Performance'],
        bottom: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Performance',
          type: 'line',
          stack: 'Total',
          data: seriesData[selectedFunds[0]],
        },
      ],
    };
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Fund Comparison" extra={
            <Space>
              <Select
                mode="multiple"
                value={selectedFunds}
                onChange={setSelectedFunds}
                style={{ width: 300 }}
                placeholder="Select funds to compare"
              >
                {Object.entries(fundsData).map(([key, fund]) => (
                  <Option key={key} value={key}>{fund.name}</Option>
                ))}
              </Select>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Option value="1m">1 Month</Option>
                <Option value="3m">3 Months</Option>
                <Option value="6m">6 Months</Option>
                <Option value="1y">1 Year</Option>
                <Option value="3y">3 Years</Option>
                <Option value="5y">5 Years</Option>
              </Select>
            </Space>
          }>
            <ReactEChartsCore
              echarts={echarts}
              notMerge={true}
              lazyUpdate={true}
              theme={"light"}
              option={getPerformanceChartOption()}
              style={{ height: '400px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Comparative Analysis">
            <Table
              columns={columns}
              dataSource={getComparisonData()}
              pagination={false}
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FundComparison;
