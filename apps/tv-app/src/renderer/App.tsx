import React from 'react';
import { ConfigProvider } from 'antd';
import TestPanel from './components/TestPanel';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <TestPanel />
      </div>
    </ConfigProvider>
  );
};

export default App; 