import { Router } from 'express';
import { RouteModel } from '../models/routeModel';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const routes = await RouteModel.getAll();
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat data rute perjalanan', error });
  }
});

export default router;