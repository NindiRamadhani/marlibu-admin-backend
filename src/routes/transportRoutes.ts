
import { Router } from 'express';

import {
  getAllTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport,
} from '../controllers/transportController';

const router = Router();

// GET semua transportasi
router.get('/', getAllTransports);

// GET detail transportasi
router.get('/:id', getTransportById);

// POST menambahkan transportasi
router.post('/', createTransport);

// PUT memperbarui transportasi
router.put('/:id', updateTransport);

// DELETE menghapus transportasi
router.delete('/:id', deleteTransport);

export default router;
