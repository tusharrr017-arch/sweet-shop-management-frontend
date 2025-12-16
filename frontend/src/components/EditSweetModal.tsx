import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Sweet } from '../services/api';

interface EditSweetModalProps {
  sweet: Sweet;
  onClose: () => void;
  onUpdate: (updates: Partial<Sweet>) => void;
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const EditSweetModal = ({ sweet, onClose, onUpdate }: EditSweetModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    form.setFieldsValue({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
    });
    
    // Reset file list when sweet changes
    if (sweet.image_url && sweet.image_url.trim() !== '') {
      // If it's a base64 image, show it in the upload component
      // If it's a URL, show it and also set it in the URL input
      setFileList([{
        uid: '-1',
        name: 'current-image',
        status: 'done',
        url: sweet.image_url,
      }]);
    } else {
      setFileList([]);
    }
  }, [sweet, form]);

  const handleSubmit = async (values: {
    name: string;
    category: string;
    price: number;
    quantity: number;
  }) => {
    setLoading(true);
    try {
      // Determine image_url value - track if user actually changed the image
      let imageUrl: string | null = null;
      let imageChanged = false;
      
      if (fileList.length > 0) {
        const file = fileList[0];
        
        // Check if it's a new file upload (has originFileObj)
        if (file.originFileObj) {
          imageChanged = true; // User uploaded a new file
          // New file uploaded - compress first, then convert to base64
          try {
            // Compress image to reduce size (max 1920x1920, 80% quality)
            const compressedFile = await compressImage(file.originFileObj, 1920, 1920, 0.8);
            
            // Check if compressed file is still too large (4MB limit for Vercel)
            if (compressedFile.size > 4 * 1024 * 1024) {
              // Try more aggressive compression
              const moreCompressed = await compressImage(file.originFileObj, 1280, 1280, 0.7);
              if (moreCompressed.size > 4 * 1024 * 1024) {
                message.error('Image is too large even after compression. Please use a smaller image or image URL.');
                setLoading(false);
                return;
              }
              imageUrl = await convertFileToBase64(moreCompressed);
            } else {
              imageUrl = await convertFileToBase64(compressedFile);
            }
            
            // Verify base64 is valid
            if (!imageUrl || imageUrl.length < 100) {
              message.error('Failed to process image - invalid data');
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('❌ Image processing error:', error);
            message.error('Failed to process image');
            setLoading(false);
            return;
          }
        } else if (file.url) {
          // Existing image URL from fileList - use it (could be URL or base64)
          // If it's a URL input (uid: '-2'), use it
          // If it's the original image (uid: '-1'), check if it's too large
          if (file.uid === '-2') {
            // User entered a URL directly
            imageUrl = file.url;
          } else if (file.uid === '-1') {
            // This is the original image - check if it's base64 and too large
            if (file.url.startsWith('data:image')) {
              // It's a base64 image - check size
              const base64Size = (file.url.length * 3) / 4; // Approximate byte size
              if (base64Size > 3.5 * 1024 * 1024) {
                // Image is too large (>3.5MB), don't send it back
                // User needs to re-upload a compressed version
                message.warning('Existing image is too large. Please upload a new image or use an image URL.');
                imageUrl = null; // Clear the image
              } else {
                // Image is small enough, keep it
                imageUrl = file.url;
              }
            } else {
              // It's a regular URL, keep it
              imageUrl = file.url;
            }
          } else {
            // Some other case - use the URL
            imageUrl = file.url;
          }
        }
      } else {
        // File list is empty - user removed the image
        if (sweet.image_url) {
          // User had an image but fileList is empty - they removed it
          imageUrl = null;
          imageChanged = true; // User explicitly removed the image
        }
        // If no original image and fileList is empty, imageUrl stays null and imageChanged stays false
      }
      
      // Build updates object
      const updates: Partial<Sweet> & { image_url?: string | null } = {
        name: values.name,
        category: values.category,
        price: values.price,
        quantity: values.quantity,
      };
      
      // Only include image_url if user actually changed it AND it's not too large
      if (imageChanged) {
        // Check size before sending (Vercel limit is 4.5MB)
        if (imageUrl && imageUrl.startsWith('data:image')) {
          const base64Size = (imageUrl.length * 3) / 4; // Approximate byte size
          if (base64Size > 3.5 * 1024 * 1024) {
            // Image is too large, don't send it
            message.error('Image is too large to upload. Please use an image URL instead or compress the image further.');
            setLoading(false);
            return;
          }
        }
        updates.image_url = imageUrl;
      }
      // If imageChanged is false, we don't include image_url at all - this prevents sending large existing images
      
      onUpdate(updates);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      message.error('Failed to update sweet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Sweet"
      open={true}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Update"
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
          <Input placeholder="Enter category" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[
            { required: true, message: 'Please enter price!' },
            {
              validator: (_, value) => {
                if (value === null || value === undefined || value === '') {
                  return Promise.reject(new Error('Please enter price!'));
                }
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                if (isNaN(numValue)) {
                  return Promise.reject(new Error('Price must be a valid number!'));
                }
                if (numValue <= 0) {
                  return Promise.reject(new Error('Price must be greater than 0!'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter price"
            prefix="$"
            min={0.01}
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
            placeholder="Enter quantity"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="image"
          label="Image"
        >
          <div>
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={(file) => {
                if (file.size > 5 * 1024 * 1024) {
                  message.error('Image must be smaller than 5MB!');
                  return false;
                }
                // Properly wrap the file in UploadFile object with originFileObj
                setFileList([{
                  uid: Date.now().toString(),
                  name: file.name,
                  status: 'done',
                  originFileObj: file,
                }]);
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
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              Or enter image URL:
            </div>
            <Input
              placeholder="https://example.com/image.jpg"
              style={{ marginTop: 4 }}
              onChange={(e) => {
                const url = e.target.value.trim();
                if (url) {
                  setFileList([{
                    uid: '-2',
                    name: 'image-url',
                    status: 'done',
                    url: url,
                  }]);
                } else if (fileList.length > 0 && fileList[0].uid === '-2') {
                  setFileList([]);
                }
              }}
              defaultValue={sweet.image_url && !sweet.image_url.startsWith('data:') ? sweet.image_url : ''}
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditSweetModal;
