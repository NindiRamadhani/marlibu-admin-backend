
import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
} from '../controllers/customerController';

const router = Router();

// GET: Mengambil seluruh data pelanggan
router.get('/', getAllCustomers);

// GET: Mengambil detail pelanggan berdasarkan ID
router.get('/:id', getCustomerById);

// DELETE: Menghapus data pelanggan
router.delete('/:id', deleteCustomer);

export default router;
