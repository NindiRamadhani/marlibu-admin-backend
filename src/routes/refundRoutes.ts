import { Router } from 'express';
import { getAllRefunds } from '../controllers/refundController';

const router = Router();

router.get('/', getAllRefunds);

export default router;
