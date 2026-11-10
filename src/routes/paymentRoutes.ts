
import { Router } from 'express';

import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
} from '../controllers/paymentController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Semua endpoint hanya dapat diakses admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Membuat pembayaran
router.post('/', createPayment);

// Mengambil semua pembayaran
router.get('/', getAllPayments);

// Mengambil detail pembayaran
router.get('/:id', getPaymentById);

// Memperbarui status pembayaran
router.patch('/:id/status', updatePaymentStatus);

export default router;
