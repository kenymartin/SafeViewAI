import React from 'react';
import { Modal, Button, List, Typography, Space } from 'antd';
import { WarningOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ContentWarningProps {
  visible: boolean;
  warnings: Array<{
    type: string;
    confidence: number;
    description: string;
  }>;
  onFilter: (filter: boolean) => void;
  onCancel: () => void;
}

export const ContentWarning: React.FC<ContentWarningProps> = ({
  visible,
  warnings,
  onFilter,
  onCancel
}) => {
  const handleFilter = (filter: boolean) => {
    onFilter(filter);
  };

  return (
    <Modal
      title={
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <Title level={4} style={{ margin: 0 }}>Content Warning</Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button
          key="filter"
          type="primary"
          icon={<EyeInvisibleOutlined />}
          onClick={() => handleFilter(true)}
        >
          Apply Filters
        </Button>,
        <Button
          key="no-filter"
          icon={<EyeOutlined />}
          onClick={() => handleFilter(false)}
        >
          Watch Without Filters
        </Button>
      ]}
      width={600}
    >
      <Text>
        The following content has been detected in this video:
      </Text>
      <List
        dataSource={warnings}
        renderItem={(warning) => (
          <List.Item>
            <List.Item.Meta
              title={warning.type}
              description={`Confidence: ${(warning.confidence * 100).toFixed(1)}%`}
            />
            <Text type="secondary">{warning.description}</Text>
          </List.Item>
        )}
      />
    </Modal>
  );
}; 