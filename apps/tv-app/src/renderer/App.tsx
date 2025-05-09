import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Typography } from 'antd';
import { ContentWarning } from './components/ContentWarning';
import { VideoPlayer } from './components/VideoPlayer';

const { Header, Content } = Layout;
const { Title } = Typography;

export const App: React.FC = () => {
  const [warnings, setWarnings] = useState<Array<{
    type: string;
    confidence: number;
    description: string;
  }>>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    // Listen for content warnings from main process
    window.api.on('content-warnings', (newWarnings: any[]) => {
      if (newWarnings.length > 0) {
        setWarnings(newWarnings);
        setShowWarning(true);
      }
    });

    // Listen for video state changes
    window.api.on('video-state', (state: any) => {
      console.log('Video state changed:', state);
    });

    return () => {
      window.api.removeListener('content-warnings');
      window.api.removeListener('video-state');
    };
  }, []);

  const handleFilter = (filter: boolean) => {
    setIsFiltered(filter);
    setShowWarning(false);
    window.api.send('apply-filter', filter);
  };

  const handleCancel = () => {
    setShowWarning(false);
    window.api.send('cancel-filter');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <Space align="center" style={{ height: '100%' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            SafeView AI
          </Title>
        </Space>
      </Header>
      <Content style={{ padding: '24px' }}>
        <VideoPlayer isFiltered={isFiltered} />
        <ContentWarning
          visible={showWarning}
          warnings={warnings}
          onFilter={handleFilter}
          onCancel={handleCancel}
        />
      </Content>
    </Layout>
  );
}; 