import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role = 'user' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const existingUser = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          error: 'User already exists. Please login instead or use a different email address.' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [email, hashedPassword, role]
      );

      const user = result.rows[0];
      const jwtSecret: string = process.env.JWT_SECRET || 'secret';
      const expiresIn: string = process.env.JWT_EXPIRES_IN || '24h';
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn } as jwt.SignOptions
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (dbError: any) {
      console.error('Database error during registration:', dbError);
      throw dbError;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', error.message, error.stack);
    const errorMessage = error.message || 'Internal server error';
    res.status(500).json({ 
      error: errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection') 
        ? 'Database connection error. Please check your database configuration.'
        : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const jwtSecret: string = process.env.JWT_SECRET || 'secret';
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '24h';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn } as jwt.SignOptions
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', error.message, error.stack);
    const errorMessage = error.message || 'Internal server error';
    res.status(500).json({ 
      error: errorMessage.includes('DATABASE_URL') || errorMessage.includes('connection') 
        ? 'Database connection error. Please check your database configuration.'
        : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

