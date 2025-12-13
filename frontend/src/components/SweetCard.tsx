import { useState } from 'react';
import { Card, Button, Space, Tag, Typography, InputNumber, Popconfirm, Image, Badge } from 'antd';
import { ShoppingCartOutlined, EditOutlined, DeleteOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Sweet } from '../services/api';

const { Title, Text } = Typography;

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (id: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestock?: (quantity: number) => void;
}

const getSweetImage = (name: string, category: string): string => {
  const nameLower = name.toLowerCase();
  const categoryLower = category.toLowerCase();
  if (nameLower.includes('chocolate')) {
    return 'https://images.unsplash.com/photo-1606312619070-d48d4cc5a55f?w=400&h=300&fit=crop';
  }
  if (nameLower.includes('gummy') || nameLower.includes('jelly')) {
    return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop';
  }
  if (nameLower.includes('lollipop')) {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
  }
  if (nameLower.includes('toffee') || nameLower.includes('caramel')) {
    return 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=300&fit=crop';
  }
  if (nameLower.includes('marshmallow')) {
    return 'https://images.unsplash.com/photo-1606312619070-d48d4cc5a55f?w=400&h=300&fit=crop';
  }
  if (nameLower.includes('licorice')) {
    return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop';
  }
  if (nameLower.includes('fudge') || nameLower.includes('truffle')) {
    return 'https://images.unsplash.com/photo-1606312619070-d48d4cc5a55f?w=400&h=300&fit=crop';
  }
  if (nameLower.includes('rock')) {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
  }
  
  if (categoryLower.includes('chocolate')) {
    return 'https://images.unsplash.com/photo-1606312619070-d48d4cc5a55f?w=400&h=300&fit=crop';
  }
  if (categoryLower.includes('gumm')) {
    return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop';
  }
  if (categoryLower.includes('hard')) {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
  }
  
  return 'https://images.unsplash.com/photo-1606312619070-d48d4cc5a55f?w=400&h=300&fit=crop';
};

const SweetCard = ({ sweet, onPurchase, onEdit, onDelete, onRestock }: SweetCardProps) => {
  const [restockQuantity, setRestockQuantity] = useState<number>(10);
  const [showRestock, setShowRestock] = useState(false);

  const handleRestock = () => {
    if (restockQuantity > 0 && onRestock) {
      onRestock(restockQuantity);
      setShowRestock(false);
      setRestockQuantity(10);
    }
  };

  const imageUrl = getSweetImage(sweet.name, sweet.category);
  const isOutOfStock = sweet.quantity === 0;

  return (
    <Card
      hoverable
      cover={
        <div style={{ height: 200, overflow: 'hidden', background: '#f0f0f0' }}>
          <Image
            src={imageUrl}
            alt={sweet.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            preview={false}
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E🍬%3C/text%3E%3C/svg%3E"
          />
        </div>
      }
      actions={
        onEdit
          ? [
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={onEdit}
              >
                Edit
              </Button>,
              <Button
                key="restock"
                type="link"
                icon={<PlusOutlined />}
                onClick={() => setShowRestock(true)}
              >
                Restock
              </Button>,
              <Popconfirm
                key="delete"
                title="Delete sweet"
                description="Are you sure you want to delete this sweet?"
                onConfirm={onDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Popconfirm>,
            ]
          : undefined
      }
      style={{ height: '100%' }}
    >
      <Card.Meta
        title={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <Title level={4} style={{ margin: 0, flex: 1 }}>
                {sweet.name}
              </Title>
              <Tag color="blue">{sweet.category}</Tag>
            </div>
            <div>
              <Text strong style={{ fontSize: '24px', color: '#1890ff' }}>
                ${parseFloat(sweet.price.toString()).toFixed(2)}
              </Text>
            </div>
            <div>
              <Text type="secondary">Stock: </Text>
              <Badge
                count={sweet.quantity}
                showZero
                style={{ backgroundColor: isOutOfStock ? '#ff4d4f' : '#52c41a' }}
              />
            </div>
          </Space>
        }
      />
      <div style={{ marginTop: 16 }}>
        <Button
          type="primary"
          block
          icon={<ShoppingCartOutlined />}
          onClick={() => onPurchase(sweet.id)}
          disabled={isOutOfStock}
          size="large"
        >
          {isOutOfStock ? 'Out of Stock' : 'Purchase'}
        </Button>
      </div>
      
      {showRestock && onRestock && (
        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <Space>
            <InputNumber
              min={1}
              value={restockQuantity}
              onChange={(value) => setRestockQuantity(value || 10)}
              style={{ width: 100 }}
              autoFocus
            />
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleRestock}
            />
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setShowRestock(false);
                setRestockQuantity(10);
              }}
            />
          </Space>
        </div>
      )}
    </Card>
  );
};

export default SweetCard;
