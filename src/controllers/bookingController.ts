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

// Menambahkan data booking baru
export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      booking_code,
      customer_id,
      schedule_id,
      created_by,
      passenger_count,
      ticket_price,
      subtotal,
      discount_amount,
      total_amount,
      booking_status,
      notes,
    } = req.body;

    if (
      !booking_code ||
      !customer_id ||
      !schedule_id ||
      ticket_price === undefined ||
      subtotal === undefined ||
      total_amount === undefined
    ) {
      res.status(400).json({
        success: false,
        message: 'Data booking wajib belum lengkap',
      });
      return;
    }

    const statusToUse =
      typeof booking_status === 'string' && booking_status.trim() !== ''
        ? booking_status.trim()
        : 'pending';

    if (!allowedStatuses.includes(statusToUse)) {
      res.status(400).json({
        success: false,
        message: 'Status booking tidak valid',
      });
      return;
    }

    const created = await BookingModel.create({
      booking_code: String(booking_code).trim(),
      customer_id: Number(customer_id),
      schedule_id: Number(schedule_id),
      created_by: created_by !== undefined && created_by !== null ? Number(created_by) : null,
      passenger_count: passenger_count !== undefined ? Number(passenger_count) : 1,
      ticket_price,
      subtotal,
      discount_amount: discount_amount !== undefined ? discount_amount : 0.0,
      total_amount,
      booking_status: statusToUse,
      notes: notes !== undefined ? notes : null,
    });

    res.status(201).json({
      success: true,
      message: 'Booking berhasil ditambahkan',
      data: created,
    });
  } catch (error: any) {
    console.error('Gagal menambahkan booking:', error);

    if (error?.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Kode booking sudah digunakan',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan booking',
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