import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
} from '../controllers/paymentController';

const router = Router();

router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.patch('/:id/status', updatePaymentStatus);

export default router;