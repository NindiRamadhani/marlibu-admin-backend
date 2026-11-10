
import { Router } from 'express';

import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from '../controllers/bookingController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Semua endpoint booking hanya bisa diakses admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);

export default router;
