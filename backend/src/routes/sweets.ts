import express from 'express';
import {
  createSweet,
  getAllSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
} from '../controllers/sweetsController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', requireAdmin, createSweet); // Admin only
router.get('/', getAllSweets);
router.get('/search', searchSweets);
router.put('/:id', updateSweet);
router.delete('/:id', requireAdmin, deleteSweet);
router.post('/:id/purchase', purchaseSweet);
router.post('/:id/restock', requireAdmin, restockSweet);

export default router;

