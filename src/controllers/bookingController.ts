
import { Request, Response } from 'express';
import { BookingModel } from '../models/bookingModel';

const allowedStatuses = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'refunded',
];

// Mengambil semua data booking
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await BookingModel.getAll();

    res.status(200).json({
      success: true,
      message: 'Daftar booking berhasil diambil',
      data: bookings,
    });
  } catch (error) {
    console.error('Gagal mengambil booking:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar booking',
    });
  }
};

// Mengambil detail booking berdasarkan kode booking
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingCode = String(req.params.bookingCode ?? '').trim();

    if (!bookingCode) {
      res.status(400).json({
        success: false,
        message: 'Kode booking harus diisi',
      });
      return;
    }

    const booking = await BookingModel.getByBookingCode(bookingCode);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Detail booking berhasil diambil',
      data: booking,
    });
  } catch (error) {
    console.error('Gagal mengambil detail booking:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail booking',
    });
  }
};

// Mengubah status booking berdasarkan kode booking
export const updateBookingStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const bookingCode = String(req.params.bookingCode ?? '').trim();
    const { status } = req.body;

    if (!bookingCode) {
      res.status(400).json({
        success: false,
        message: 'Kode booking harus diisi',
      });
      return;
    }

    if (
      typeof status !== 'string' ||
      !allowedStatuses.includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: 'Status booking tidak valid',
      });
      return;
    }

    const updated = await BookingModel.updateStatus(
      bookingCode,
      status
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Status booking berhasil diperbarui',
    });
  } catch (error) {
    console.error('Gagal memperbarui status booking:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status booking',
    });
  }
};
