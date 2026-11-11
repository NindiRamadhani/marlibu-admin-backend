
import { Router } from 'express';

import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../controllers/routeController';

const router = Router();

// GET: Semua data rute
router.get('/', getAllRoutes);

// GET: Detail rute berdasarkan ID
router.get('/:id', getRouteById);

// POST: Tambah rute
router.post('/', createRoute);

// PUT: Edit rute
router.put('/:id', updateRoute);

// DELETE: Hapus rute
router.delete('/:id', deleteRoute);

export default router;
