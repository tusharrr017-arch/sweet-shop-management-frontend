import { useState, useEffect, useMemo } from 'react';
import { Layout, Row, Col, Button, Space, Tag, Spin, Empty, message, Avatar, Pagination, Drawer } from 'antd';
import { PlusOutlined, LogoutOutlined, UserOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { sweetsApi, Sweet } from '../services/api';
import SweetCard from '../components/SweetCard';
import SearchBar from '../components/SearchBar';
import AddSweetModal from '../components/AddSweetModal';
import EditSweetModal from '../components/EditSweetModal';
import Logo from '../components/Logo';

const { Header, Content } = Layout;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [searchParams, setSearchParams] = useState({
    name: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const savedPage = localStorage.getItem('sweetsCurrentPage');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
  }, []);

  useEffect(() => {
    loadSweets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sweets, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
    localStorage.setItem('sweetsCurrentPage', '1');
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('sweetsCurrentPage', currentPage.toString());
  }, [currentPage]);

  const paginatedSweets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSweets.slice(startIndex, endIndex);
  }, [filteredSweets, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSweets.length / pageSize);

  const loadSweets = async () => {
    try {
      setLoading(true);
      const data = await sweetsApi.getAll();
      setSweets(data);
      setFilteredSweets(data);
    } catch (error) {
      message.error('Failed to load sweets');
      console.error('Failed to load sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      if (searchParams.name || searchParams.category || searchParams.minPrice || searchParams.maxPrice) {
        const results = await sweetsApi.search({
          name: searchParams.name || undefined,
          category: searchParams.category || undefined,
          minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
          maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
        });
        setFilteredSweets(results);
      } else {
        setFilteredSweets(sweets);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setFilteredSweets(sweets);
    }
  };

  const handlePurchase = async (id: number) => {
    try {
      await sweetsApi.purchase(id, 1);
      message.success('Purchase successful!');
      await loadSweets();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Purchase failed');
    }
  };

  const handleAddSweet = async (sweet: Omit<Sweet, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await sweetsApi.create(sweet);
      setShowAddModal(false);
      message.success('Sweet added successfully!');
      await loadSweets();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to add sweet');
    }
  };

  const handleUpdateSweet = async (id: number, updates: Partial<Sweet>) => {
    try {
      await sweetsApi.update(id, updates);
      setEditingSweet(null);
      message.success('Sweet updated successfully!');
      await loadSweets();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to update sweet');
    }
  };

  const handleDeleteSweet = async (id: number) => {
    try {
      await sweetsApi.delete(id);
      message.success('Sweet deleted successfully!');
      await loadSweets();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to delete sweet');
    }
  };

  const handleRestock = async (id: number, quantity: number) => {
    try {
      await sweetsApi.restock(id, quantity);
      message.success('Restocked successfully!');
      await loadSweets();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Restock failed');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SidebarContent = () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      padding: '24px 16px'
      }}>
      <div style={{
        display: 'flex', 
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        background: '#fff',
        borderRadius: '8px',
        marginTop: '20px',
        gap: '12px',
        
        border: '1px solid #f0f0f0'
      }}>
        <Avatar 
          icon={<UserOutlined />} 
          style={{ backgroundColor: '#1890ff', flexShrink: 0 }} 
          size={48}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#000',
            wordBreak: 'break-word',
            lineHeight: '1.4'
          }}>
            {user?.email}
          </div>
          {isAdmin && (
            <Tag 
              style={{ 
                margin: 0, 
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '4px',
                border: 'none',
                background: '#fff1f0',
                color: '#cf1322',
                alignSelf: 'flex-start',
                fontWeight: 500
              }}
            >
              Admin
            </Tag>
          )}
        </div>
      </div>

      <Space direction="vertical" size="middle" style={{ width: '100%', flex: 1 }}>
        {isAdmin && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setShowAddModal(true);
              setMobileMenuOpen(false);
            }}
            block
            size="large"
          >
            Add Sweet
          </Button>
        )}
        
        <Button 
          icon={<LogoutOutlined />} 
          onClick={() => {
            logout();
            setMobileMenuOpen(false);
          }}
          block
          size="large"
          danger
          style={{ marginTop: 'auto' }}
        >
          Logout
        </Button>
      </Space>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header 
        className={`main-header ${mobileMenuOpen ? 'drawer-open' : ''}`}
        style={{ 
          background: '#fff', 
          padding: '0 24px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: 80
        }}
      >
        <div className="header-left">
          <div className="desktop-profile">
            <Space size={12} align="start">
              <Avatar 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#1890ff', flexShrink: 0 }} 
                size={40}
              />
              <div style={{ display: 'flex', paddingTop:'10px',flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: '#000',
                  lineHeight: '1.4'
                }}>
                  {user?.email}
                </div>
                {isAdmin && (
                  <Tag 
                    style={{ 
                      margin: 0, 
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#fff1f0',
                      color: '#cf1322',
                      alignSelf: 'flex-start',
                      fontWeight: 500
                    }}
                  >
                    Admin
                  </Tag>
                )}
              </div>
            </Space>
          </div>
          
          <Button
            className="mobile-hamburger"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            style={{ fontSize: '24px', padding: '4px 8px' }}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Logo size="medium" showTagline={false} />
        </div>

        <div className="header-right">
          <Space size="middle" className="desktop-actions">
            {isAdmin && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowAddModal(true)}
              >
                Add Sweet
              </Button>
            )}
            <Button 
              icon={<LogoutOutlined />} 
              onClick={logout}
            >
              Logout
            </Button>
          </Space>
          <div className="mobile-spacer" style={{ width: '40px' }} />
        </div>
      </Header>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Menu</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '18px' }}
            />
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        bodyStyle={{ padding: 0 }}
        width={280}
        closable={false}
        className="mobile-drawer"
        maskClosable={true}
      >
        <SidebarContent />
      </Drawer>

      <Content style={{ 
        padding: '24px', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%'
      }}>
        <SearchBar searchParams={searchParams} setSearchParams={setSearchParams} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredSweets.length === 0 ? (
          <Empty 
            description="No sweets found" 
            style={{ padding: '60px 0' }}
          />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paginatedSweets.map((sweet) => (
                <Col key={sweet.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <SweetCard
                    sweet={sweet}
                    onPurchase={handlePurchase}
                    onEdit={isAdmin ? () => setEditingSweet(sweet) : undefined}
                    onDelete={isAdmin ? () => handleDeleteSweet(sweet.id) : undefined}
                    onRestock={isAdmin ? (quantity) => handleRestock(sweet.id, quantity) : undefined}
                  />
                </Col>
              ))}
            </Row>

            {totalPages > 1 && (
              <div style={{ 
                marginTop: '24px', 
                display: 'flex', 
                justifyContent: 'center',
                paddingBottom: '16px',
                overflowX: 'auto'
              }}>
                <Pagination
                  current={currentPage}
                  total={filteredSweets.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  responsive
                  showTotal={(total, range) => (
                    <span className="hide-on-mobile">
                      {range[0]}-{range[1]} of {total} sweets
                    </span>
                  )}
                  simple={false}
                />
              </div>
            )}
          </>
        )}
      </Content>

      {showAddModal && (
        <AddSweetModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSweet}
        />
      )}

      {editingSweet && (
        <EditSweetModal
          sweet={editingSweet}
          onClose={() => setEditingSweet(null)}
          onUpdate={(updates) => handleUpdateSweet(editingSweet.id, updates)}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
