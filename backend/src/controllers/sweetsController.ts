import { Response } from 'express';
import { AuthRequest } from '../types';
import pool from '../config/database';

export const createSweet = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, price, quantity, image_url } = req.body;

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, category, price, and quantity are required' });
    }

    const result = await pool.query(
      'INSERT INTO sweets (name, category, price, quantity, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category, price, quantity, image_url || null]
    );

    res.status(201).json({ message: 'Sweet created successfully', sweet: result.rows[0] });
  } catch (error: any) {
    console.error('Create sweet error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllSweets = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM sweets ORDER BY created_at DESC');
    res.json({ sweets: result.rows });
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchSweets = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    let query = 'SELECT * FROM sweets WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (name) {
      paramCount++;
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND category ILIKE $${paramCount}`;
      params.push(`%${category}%`);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      params.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      params.push(parseFloat(maxPrice as string));
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ sweets: result.rows });
  } catch (error) {
    console.error('Search sweets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSweet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity, image_url } = req.body;

    const sweetId = parseInt(id);
    if (isNaN(sweetId)) {
      return res.status(400).json({ error: 'Invalid sweet ID' });
    }

    const existing = await pool.query('SELECT * FROM sweets WHERE id = $1', [sweetId]);
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name);
    }
    if (category !== undefined) {
      paramCount++;
      updates.push(`category = $${paramCount}`);
      values.push(category);
    }
    if (price !== undefined) {
      paramCount++;
      updates.push(`price = $${paramCount}`);
      values.push(price);
    }
    if (quantity !== undefined) {
      paramCount++;
      updates.push(`quantity = $${paramCount}`);
      values.push(quantity);
    }
    if (image_url !== undefined) {
      paramCount++;
      updates.push(`image_url = $${paramCount}`);
      values.push(image_url || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    
    paramCount++;
    values.push(sweetId);
    const query = `UPDATE sweets SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      const doubleCheck = await pool.query('SELECT id FROM sweets WHERE id = $1', [sweetId]);
      if (doubleCheck.rows.length === 0) {
        return res.status(404).json({ error: `Sweet with ID ${sweetId} not found` });
      } else {
        return res.status(500).json({ error: 'Update failed - sweet exists but update did not return data' });
      }
    }

    res.json({ message: 'Sweet updated successfully', sweet: result.rows[0] });
  } catch (error: any) {
    console.error('Update sweet error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteSweet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM sweets WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const purchaseSweet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const sweetId = parseInt(id);
    if (isNaN(sweetId)) {
      return res.status(400).json({ error: 'Invalid sweet ID' });
    }

    const sweetResult = await pool.query('SELECT * FROM sweets WHERE id = $1', [sweetId]);

    if (sweetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    const sweet = sweetResult.rows[0];

    if (sweet.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity in stock' });
    }

    const newQuantity = sweet.quantity - quantity;
    const result = await pool.query(
      'UPDATE sweets SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newQuantity, sweetId]
    );

    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to update sweet' });
    }

    res.json({
      message: 'Purchase successful',
      sweet: result.rows[0],
      purchased: quantity,
    });
  } catch (error: any) {
    console.error('Purchase sweet error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const restockSweet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const sweetResult = await pool.query('SELECT * FROM sweets WHERE id = $1', [id]);

    if (sweetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    const sweet = sweetResult.rows[0];
    const newQuantity = sweet.quantity + quantity;

    const result = await pool.query(
      'UPDATE sweets SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newQuantity, id]
    );

    res.json({
      message: 'Restock successful',
      sweet: result.rows[0],
      restocked: quantity,
    });
  } catch (error) {
    console.error('Restock sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

