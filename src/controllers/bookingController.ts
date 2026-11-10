import { Request, Response } from 'express';
import { BookingModel } from '../models/bookingModel';

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await BookingModel.getAll();

    res.json({
      success: true,
      message: 'Daftar booking berhasil diambil',
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error server',
      error,
    });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await BookingModel.getById(Number(req.params.id));

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error server',
      error,
    });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status booking harus diisi',
      });
      return;
    }

    const updated = await BookingModel.updateStatus(
      Number(req.params.id),
      status
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Status booking berhasil diperbarui',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error server',
      error,
    });
  }
};