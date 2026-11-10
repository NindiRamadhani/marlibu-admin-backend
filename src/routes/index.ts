import { Router } from 'express';

import customerRoutes from './customerRoutes';
import authRoutes from './authRoutes';
import bookingRoutes from './bookingRoutes';
import dashboardRoutes from './dashboardRoutes';
import paymentRoutes from './paymentRoutes';

import { authMiddleware } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

// Login admin tidak membutuhkan token.
router.use('/auth', authRoutes);

// Middleware khusus admin.
const adminOnly = [
  authMiddleware,
  authorizeRoles('admin'),
];

// Route booking khusus admin.
router.use('/bookings', ...adminOnly, bookingRoutes);

// Route dashboard khusus admin.
router.use('/dashboard', ...adminOnly, dashboardRoutes);

// Route pembayaran khusus admin.
router.use('/payments', ...adminOnly, paymentRoutes);

// Route customer yang sudah tersedia tetap dipakai.
router.use('/customers', customerRoutes);

export default router;