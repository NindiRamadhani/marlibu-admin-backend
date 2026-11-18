import { Router } from 'express';
import {
  login,
  googleLogin,
  changePassword,
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Route Login & Auth
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/google-login', googleLogin); // Menjaga kompatibilitas jika frontend memanggil '/google-login'

// Route Ganti Password (Dilindungi authMiddleware agar req.user terbaca)
router.put('/change-password', authMiddleware, changePassword);

export default router;