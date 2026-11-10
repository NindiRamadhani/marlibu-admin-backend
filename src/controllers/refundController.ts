import { Request, Response } from 'express';
import { RefundModel } from '../models/refundModel';

// Mengambil semua data refund (GET)
export const getAllRefunds = async (req: Request, res: Response) => {
  try {
    const refunds = await RefundModel.getAll();
    res.json({ success: true, message: 'Daftar refund berhasil diambil', data: refunds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};

// Membuat/Mengajukan refund baru (POST)
export const createRefund = async (req: Request, res: Response) => {
  try {
    const result = await RefundModel.create(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Refund berhasil diajukan', 
      data: result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};

// --- TAMBAHKAN FUNGSI INI ---
// Memperbarui status refund (PUT /:id)
export const updateRefundStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    // Panggil fungsi updateStatus dari model yang sudah kamu buat
    const result = await RefundModel.updateStatus(Number(id), status, admin_note);

    res.json({
      success: true,
      message: 'Status refund berhasil diperbarui',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server saat update status', error });
  }
};