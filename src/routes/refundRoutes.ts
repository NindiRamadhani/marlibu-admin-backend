import { Router } from 'express';
import { getAllRefunds, createRefund, updateRefundStatus } from '../controllers/refundController';

const router = Router();

router.get('/', getAllRefunds);
router.post('/', createRefund);
router.put('/:id', updateRefundStatus); // <-- TAMBAHKAN RUTE PUT INI

export default router;