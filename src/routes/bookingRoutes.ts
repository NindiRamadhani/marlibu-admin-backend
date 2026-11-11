
import { Router } from 'express';

import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from '../controllers/bookingController';

import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAllBookings);
router.get('/:bookingCode', getBookingById);
router.patch('/:bookingCode/status', updateBookingStatus);

export default router;
