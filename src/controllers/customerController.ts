
import { Request, Response } from 'express';
import { CustomerModel } from '../models/customerModel';

export const getAllCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const customers = await CustomerModel.getAll();

    return res.status(200).json({
      success: true,
      message: 'Daftar customer berhasil diambil',
      data: customers,
    });
  } catch (error) {
    console.error('Get customers error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pelanggan',
    });
  }
};

export const getCustomerById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID pelanggan tidak valid',
      });
    }

    const customer = await CustomerModel.getById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Pelanggan tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Get customer detail error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail pelanggan',
    });
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID pelanggan tidak valid',
      });
    }

    const deleted = await CustomerModel.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Pelanggan tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pelanggan berhasil dihapus',
    });
  } catch (error: any) {
    if (error.message === 'CUSTOMER_HAS_BOOKINGS') {
      return res.status(409).json({
        success: false,
        message: 'Pelanggan memiliki riwayat booking sehingga tidak dapat dihapus.',
      });
    }

    console.error('Delete customer error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus pelanggan',
    });
  }
};
