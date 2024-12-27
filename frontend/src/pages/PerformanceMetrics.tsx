import React, { useState } from 'react';
import { Card, Row, Col, Select, DatePicker, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PerformanceMetrics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('1y');
  const [benchmark, setBenchmark] = useState('sp500');

  // Mock performance data
  const performanceData = {
    returns: {
      mtd: 2.5,
      qtd: 7.8,
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
  };

  // Mock time series data
  const getTimeSeriesData = () => {
    const dates = [];
    const fundValues = [];
    const benchmarkValues = [];
    let fundValue = 100;
    let benchmarkValue = 100;

    for (let i = 0; i < 365; i++) {
      const date = moment().subtract(365 - i, 'days').format('YYYY-MM-DD');
      const fundChange = (Math.random() - 0.48) * 2;
      const benchmarkChange = (Math.random() - 0.48) * 1.8;
      
      fundValue *= (1 + fundChange / 100);
      benchmarkValue *= (1 + benchmarkChange / 100);
      
      dates.push(date);
      fundValues.push(fundValue);
      benchmarkValues.push(benchmarkValue);
    }

    return { dates, fundValues, benchmarkValues };
  };

  const getPerformanceChartOption = () => {
    const { dates, fundValues, benchmarkValues } = getTimeSeriesData();

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = params[0].axisValue;
          const items = params.map((param: any) => {
            const color = param.color;
            const name = param.seriesName;
            const value = param.value.toFixed(2);
            return `<span style="color:${color}">${name}: ${value}</span>`;
          }).join('<br/>');
          return `${date}<br/>${items}`;
        },
      },
      legend: {
        data: ['Fund Performance', 'Benchmark'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '60px',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}',
        },
      },
      series: [
        {
          name: 'Fund Performance',
          type: 'line',
          data: fundValues,
          smooth: true,
          lineStyle: {
            width: 2,
          },
        },
        {
          name: 'Benchmark',
          type: 'line',
          data: benchmarkValues,
          smooth: true,
          lineStyle: {
            width: 2,
          },
        },
      ],
    };
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Performance Analysis" extra={
            <div style={{ display: 'flex', gap: '16px' }}>
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
              <Select
                value={benchmark}
                onChange={setBenchmark}
                style={{ width: 120 }}
              >
                <Option value="sp500">S&P 500</Option>
                <Option value="nasdaq">NASDAQ</Option>
                <Option value="djia">DJIA</Option>
              </Select>
            </div>
          }>
            <ReactECharts 
              option={getPerformanceChartOption()} 
              style={{ height: '400px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Alpha"
              value={performanceData.metrics.alpha}
              precision={2}
              valueStyle={{ color: performanceData.metrics.alpha >= 0 ? '#3f8600' : '#cf1322' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Beta"
              value={performanceData.metrics.beta}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Sharpe Ratio"
              value={performanceData.metrics.sharpeRatio}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Sortino Ratio"
              value={performanceData.metrics.sortino}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Max Drawdown"
              value={performanceData.metrics.maxDrawdown}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Volatility"
              value={performanceData.metrics.volatility}
              precision={2}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Returns Analysis">
            <Row gutter={[16, 16]}>
              <Col span={4}>
                <Statistic
                  title="MTD Return"
                  value={performanceData.returns.mtd}
                  precision={2}
                  valueStyle={{ color: performanceData.returns.mtd >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={performanceData.returns.mtd >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="QTD Return"
                  value={performanceData.returns.qtd}
                  precision={2}
                  valueStyle={{ color: performanceData.returns.qtd >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={performanceData.returns.qtd >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="YTD Return"
                  value={performanceData.returns.ytd}
                  precision={2}
                  valueStyle={{ color: performanceData.returns.ytd >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={performanceData.returns.ytd >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="1Y Return"
                  value={performanceData.returns['1y']}
                  precision={2}
                  valueStyle={{ color: performanceData.returns['1y'] >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={performanceData.returns['1y'] >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="3Y Return"
                  value={performanceData.returns['3y']}
                  precision={2}
                  valueStyle={{ color: performanceData.returns['3y'] >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={performanceData.returns['3y'] >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="5Y Return"
                  value={performanceData.returns['5y']}
                  precision={2}
                  valueStyle={{ color: performanceData.returns['5y'] >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={performanceData.returns['5y'] >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceMetrics;
