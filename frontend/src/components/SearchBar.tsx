import { Card, Row, Col, Input, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

interface SearchBarProps {
  searchParams: {
    name: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  };
  setSearchParams: (params: {
    name: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

const SearchBar = ({ searchParams, setSearchParams }: SearchBarProps) => {
  const handleChange = (field: string, value: string) => {
    setSearchParams({
      ...searchParams,
      [field]: value,
    });
  };

  const handleClear = () => {
    setSearchParams({
      name: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Search by name..."
            prefix={<SearchOutlined />}
            value={searchParams.name}
            onChange={(e) => handleChange('name', e.target.value)}
            allowClear
            size="large"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Search by category..."
            prefix={<SearchOutlined />}
            value={searchParams.category}
            onChange={(e) => handleChange('category', e.target.value)}
            allowClear
            size="large"
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Input
            type="number"
            placeholder="Min Price"
            value={searchParams.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            prefix="$"
            allowClear
            size="large"
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Input
            type="number"
            placeholder="Max Price"
            value={searchParams.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            prefix="$"
            allowClear
            size="large"
          />
        </Col>
        <Col xs={24} sm={24} md={4}>
          <Button
            block
            icon={<ClearOutlined />}
            onClick={handleClear}
            size="large"
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default SearchBar;
