import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  password: string;
  role: 'user' | 'admin';
  created_at: Date;
}

export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}
