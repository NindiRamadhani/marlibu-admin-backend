import { Router } from 'express';
import { SettingController } from '../controllers/settingController';

const router = Router();

router.get('/', SettingController.getSettings);
router.put('/:id', SettingController.updateSettings);

export default router;