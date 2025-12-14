import { useState } from 'react';
import { Modal, Form, Input, InputNumber, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Sweet } from '../services/api';

interface AddSweetModalProps {
  onClose: () => void;
  onAdd: (sweet: Omit<Sweet, 'id' | 'created_at' | 'updated_at'>) => void;
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const AddSweetModal = ({ onClose, onAdd }: AddSweetModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: {
    name: string;
    category: string;
    price: number;
    quantity: number;
  }) => {
    setLoading(true);
    try {
      let imageUrl: string | undefined;
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        try {
          imageUrl = await convertFileToBase64(fileList[0].originFileObj);
        } catch (error) {
          message.error('Failed to process image');
          setLoading(false);
          return;
        }
      }

      onAdd({ ...values, image_url: imageUrl });
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Failed to add sweet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Sweet"
      open={true}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Add Sweet"
      cancelText="Cancel"
      width="90%"
      style={{ maxWidth: '500px' }}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter sweet name!' }]}
        >
          <Input placeholder="Enter sweet name" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please enter category!' }]}
        >
          <Input placeholder="Enter category (e.g., Chocolate, Gummies)" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[
            { required: true, message: 'Please enter price!' },
            { type: 'number', min: 0, message: 'Price must be positive!' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter price"
            prefix="$"
            min={0}
            step={0.01}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[
            { required: true, message: 'Please enter quantity!' },
            { type: 'number', min: 0, message: 'Quantity must be non-negative!' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter initial quantity"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="image"
          label="Image"
        >
          <Upload
            listType="picture"
            fileList={fileList}
            beforeUpload={(file) => {
              if (file.size > 5 * 1024 * 1024) {
                message.error('Image must be smaller than 5MB!');
                return false;
              }
              setFileList([file]);
              return false;
            }}
            onRemove={() => {
              setFileList([]);
              return true;
            }}
            accept="image/*"
            maxCount={1}
          >
            <button type="button" style={{ border: 0, background: 'none' }}>
              <UploadOutlined /> Click to upload
            </button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddSweetModal;
