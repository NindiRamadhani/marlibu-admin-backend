import { Router } from 'express';
import customerRoutes from './customerRoutes';

const router = Router();

// Customer API
router.use('/customers', customerRoutes);

export default router;