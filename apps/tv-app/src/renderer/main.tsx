import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import './styles.css';

// Initialize the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

// Send ready event to main process
window.api.send('app-ready', 'Renderer process is ready');

// Listen for response from main process
window.api.on('app-ready-reply', (message: string) => {
  console.log('Message from main process:', message);
});

ReactDOM.createRoot(rootElement || document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>
); 