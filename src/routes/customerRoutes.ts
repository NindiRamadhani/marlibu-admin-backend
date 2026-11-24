
import { Router } from 'express';

import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  deleteCustomer,
} from '../controllers/customerController';

const router = Router();

// GET semua pelanggan
router.get('/', getAllCustomers);

// POST tambah pelanggan
router.post('/', createCustomer);

// GET detail pelanggan
router.get('/:id', getCustomerById);

// DELETE pelanggan
router.delete('/:id', deleteCustomer);

export default router;
