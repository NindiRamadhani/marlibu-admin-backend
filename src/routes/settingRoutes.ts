import { Router } from 'express';
import { SettingModel } from '../models/settingModel';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const settings = await SettingModel.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat pengaturan', error });
  }
});

export default router;