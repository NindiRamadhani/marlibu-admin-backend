import { Router } from 'express';
import { TransportModel } from '../models/transportModel';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const transports = await TransportModel.getAll();
    res.json({ success: true, data: transports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat data transportasi', error });
  }
});

export default router;