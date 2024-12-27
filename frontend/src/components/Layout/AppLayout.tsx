import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChartOutlined,
  CompressOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <BarChartOutlined />,
      label: <Link to="/">Portfolio Analysis</Link>,
    },
    {
      key: '/holdings',
      icon: <LineChartOutlined />,
      label: <Link to="/holdings">Holdings Analysis</Link>,
    },
    {
      key: '/performance',
      icon: <PieChartOutlined />,
      label: <Link to="/performance">Performance Metrics</Link>,
    },
    {
      key: '/comparison',
      icon: <CompressOutlined />,
      label: <Link to="/comparison">Fund Comparison</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} style={{ background: '#fff' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#001529', 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            Hedge Fund Analytics
          </div>
        </Header>
        <Content
          style={{
            background: '#fff',
            padding: 24,
            margin: 0,
            borderRadius: '4px',
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
