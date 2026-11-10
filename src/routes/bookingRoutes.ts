import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} from '../controllers/bookingController';

const router = Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);

export default router;