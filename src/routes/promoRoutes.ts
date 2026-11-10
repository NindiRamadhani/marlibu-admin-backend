
import { Router } from 'express';

import {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
} from '../controllers/promoController';

const router = Router();

// Mengambil semua promo
router.get('/', getAllPromos);

// Mengambil detail promo
router.get('/:id', getPromoById);

// Menambahkan promo
router.post('/', createPromo);

// Mengubah promo
router.put('/:id', updatePromo);

// Menghapus promo
router.delete('/:id', deletePromo);

export default router;
