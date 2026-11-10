
import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';

const router = Router();

// Dashboard statistics
router.get('/', getDashboardStats);

// Dashboard statistics (alternative endpoint)
router.get('/stats', getDashboardStats);

export default router;
