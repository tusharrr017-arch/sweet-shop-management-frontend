import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './Login.css';

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await register(values.email, values.password);
      message.success('Registration successful!');
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      message.error(errorMessage);
      
      if (errorMessage.includes('already exists')) {
        setTimeout(() => {
          if (window.confirm('This email is already registered. Would you like to go to the login page?')) {
            navigate('/login');
          }
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" bordered={false}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Logo size="large" showTagline={true} />
            <Title level={4} type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
              Create a new account
            </Title>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password (min 6 characters)"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<UserAddOutlined />}
              >
                Register
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary">
            Already have an account? <Link to="/login">Login here</Link>
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default Register;
