import { Router } from 'express';
import { getAllPromos } from '../controllers/promoController';

const router = Router();

router.get('/', getAllPromos);

export default router;
