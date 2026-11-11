
import { Router } from 'express';

import {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController';

const router = Router();

// GET semua jadwal
router.get('/', getAllSchedules);

// GET detail jadwal
router.get('/:id', getScheduleById);

// POST tambah jadwal
router.post('/', createSchedule);

// PUT edit jadwal
router.put('/:id', updateSchedule);

// DELETE hapus jadwal
router.delete('/:id', deleteSchedule);

export default router;
