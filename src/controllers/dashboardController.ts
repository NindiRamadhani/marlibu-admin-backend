
import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/db';

// Tipe data hasil query
interface CountRow extends RowDataPacket {
  total: number | string;
}

interface RevenueRow extends RowDataPacket {
  total_revenue: number | string | null;
}

interface BookingRow extends RowDataPacket {
  id: number;
  booking_code: string;
  customer_name: string;
  customer_email: string | null;
  booking_datetime: Date;
  passenger_count: number;
  total_amount: number | string;
  booking_status: string;
  payment_status: string | null;
  total_paid: number | string | null;
}

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Total booking
    const [bookingResult] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM bookings
    `);

    // 2. Total pelanggan
    const [customerResult] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM customers
    `);

    // 3. Total pendapatan dari pembayaran terverifikasi
    const [revenueResult] = await pool.query<RevenueRow[]>(`
      SELECT COALESCE(SUM(amount), 0) AS total_revenue
      FROM payments
      WHERE status = 'verified'
    `);

    // 4. Total booking pending
    const [pendingResult] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE booking_status = 'pending'
    `);

    // 5. Total booking confirmed
    const [confirmedResult] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE booking_status = 'confirmed'
    `);

    // 6. Booking terbaru beserta informasi pelanggan
    const [latestBookings] = await pool.query<BookingRow[]>(`
      SELECT
        b.id,
        b.booking_code,
        c.name AS customer_name,
        c.email AS customer_email,
        b.booking_datetime,
        b.passenger_count,
        b.total_amount,
        b.booking_status,
        p.payment_status,
        p.total_paid

      FROM bookings b

      LEFT JOIN customers c
        ON b.customer_id = c.id

      LEFT JOIN (
        SELECT
          booking_id,
          MAX(status) AS payment_status,
          SUM(
            CASE
              WHEN status = 'verified' THEN amount
              ELSE 0
            END
          ) AS total_paid
        FROM payments
        GROUP BY booking_id
      ) p
        ON b.id = p.booking_id

      ORDER BY b.booking_datetime DESC

      LIMIT 10
    `);

    // Kirim response dashboard
    res.status(200).json({
      success: true,
      message: 'Statistik dashboard berhasil diambil',

      data: {
        totalBookings: Number(bookingResult[0]?.total || 0),

        totalCustomers: Number(customerResult[0]?.total || 0),

        totalRevenue: Number(
          revenueResult[0]?.total_revenue || 0
        ),

        pendingBookings: Number(
          pendingResult[0]?.total || 0
        ),

        confirmedBookings: Number(
          confirmedResult[0]?.total || 0
        ),

        latestBookings: latestBookings.map((booking) => ({
          id: booking.id,
          bookingCode: booking.booking_code,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          bookingDate: booking.booking_datetime,
          passengerCount: booking.passenger_count,
          totalAmount: Number(booking.total_amount),
          bookingStatus: booking.booking_status,
          paymentStatus: booking.payment_status,
          totalPaid: Number(booking.total_paid || 0),
        })),
      },
    });

  } catch (error) {
    console.error('Dashboard Controller Error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik dashboard',
    });
  }
};
