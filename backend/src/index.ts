import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const pool = await import('./config/database');
    await pool.default.query('SELECT 1');
    res.json({ status: 'ok', message: 'Sweet Shop API is running', database: 'connected' });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Sweet Shop API is running but database connection failed',
      error: error.message 
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

