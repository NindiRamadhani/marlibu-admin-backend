import { Request, Response } from 'express';
import { PaymentModel } from '../models/paymentModel';

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await PaymentModel.getAll();

    res.json({
      success: true,
      message: 'Daftar pembayaran berhasil diambil',
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error server',
      error,
    });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const payment = await PaymentModel.getById(Number(req.params.id));

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan',
      });
      return;
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error server',
      error,
    });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status pembayaran harus diisi',
      });
      return;
    }

    const updated = await PaymentModel.updateStatus(
      Number(req.params.id),
      status
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Status pembayaran berhasil diperbarui',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error server',
      error,
    });
  }
};