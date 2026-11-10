
import { Request, Response } from 'express';
import { PaymentModel } from '../models/paymentModel';

const allowedStatuses = ['pending', 'verified', 'rejected'];

const allowedMethods = [
  'bank_transfer',
  'cash',
  'qris',
  'e_wallet',
  'credit_card',
  'other',
];

export const getAllPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payments = await PaymentModel.getAll();

    res.status(200).json({
      success: true,
      message: 'Daftar pembayaran berhasil diambil',
      data: payments,
    });
  } catch (error) {
    console.error('Get payments error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pembayaran',
    });
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID pembayaran tidak valid',
      });
      return;
    }

    const payment = await PaymentModel.getById(id);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Detail pembayaran berhasil diambil',
      data: payment,
    });
  } catch (error) {
    console.error('Get payment detail error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail pembayaran',
    });
  }
};

// Membuat pembayaran baru
export const createPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      payment_code,
      booking_id,
      payment_method,
      amount,
      payment_date,
      proof_url,
      transaction_reference,
    } = req.body;

    if (
      typeof payment_code !== 'string' ||
      !payment_code.trim() ||
      !Number.isInteger(Number(booking_id)) ||
      Number(booking_id) <= 0 ||
      !allowedMethods.includes(payment_method) ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      res.status(400).json({
        success: false,
        message: 'Data pembayaran tidak valid',
      });
      return;
    }

    if (
      (proof_url !== undefined &&
        proof_url !== null &&
        typeof proof_url !== 'string') ||
      (transaction_reference !== undefined &&
        transaction_reference !== null &&
        typeof transaction_reference !== 'string')
    ) {
      res.status(400).json({
        success: false,
        message: 'Bukti atau referensi transaksi tidak valid',
      });
      return;
    }

    const paymentId = await PaymentModel.create({
      payment_code: payment_code.trim(),
      booking_id: Number(booking_id),
      payment_method,
      amount: Number(amount),
      payment_date: payment_date ?? null,
      proof_url: proof_url ?? null,
      transaction_reference: transaction_reference ?? null,
    });

    res.status(201).json({
      success: true,
      message: 'Pembayaran berhasil dibuat',
      data: {
        id: paymentId,
      },
    });
  } catch (error) {
    console.error('Create payment error:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan',
        });
        return;
      }

      if (error.message === 'PAYMENT_ALREADY_EXISTS') {
        res.status(409).json({
          success: false,
          message: 'Booking sudah memiliki pembayaran aktif',
        });
        return;
      }

      if (error.message === 'PAYMENT_AMOUNT_MISMATCH') {
        res.status(400).json({
          success: false,
          message: 'Jumlah pembayaran tidak sesuai total booking',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Gagal membuat pembayaran',
    });
  }
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status, adminNote } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID pembayaran tidak valid',
      });
      return;
    }

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status harus pending, verified, atau rejected',
      });
      return;
    }

    if (
      adminNote !== undefined &&
      (typeof adminNote !== 'string' || adminNote.length > 1000)
    ) {
      res.status(400).json({
        success: false,
        message: 'Catatan admin tidak valid',
      });
      return;
    }

    const payment = await PaymentModel.getById(id);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan',
      });
      return;
    }

    if (payment.status !== 'pending') {
      res.status(409).json({
        success: false,
        message: 'Pembayaran ini sudah diproses',
      });
      return;
    }

    const updated = await PaymentModel.updateStatus(
      id,
      status as 'pending' | 'verified' | 'rejected',
      req.user?.id,
      adminNote?.trim() || null
    );

    if (!updated) {
      res.status(409).json({
        success: false,
        message: 'Pembayaran gagal diperbarui',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Status pembayaran berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update payment status error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status pembayaran',
    });
  }
};
