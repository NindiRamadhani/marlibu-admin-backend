
import { RowDataPacket } from 'mysql2';
import pool from '../config/db';

interface CountRow extends RowDataPacket {
  total: number | string;
}

interface RevenueRow extends RowDataPacket {
  total_revenue: number | string | null;
}

export class DashboardModel {
  static async getSummaryStats() {
    // 1. Total pelanggan
    const [customerRows] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM customers
    `);

    // 2. Total booking
    const [bookingRows] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM bookings
    `);

    // 3. Total refund
    const [refundRows] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM refunds
    `);

    // 4. Total pendapatan dari pembayaran terverifikasi
    const [revenueRows] = await pool.query<RevenueRow[]>(`
      SELECT COALESCE(SUM(amount), 0) AS total_revenue
      FROM payments
      WHERE status = 'verified'
    `);

    // 5. Booking menunggu
    const [pendingRows] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE booking_status = 'pending'
    `);

    // 6. Booking dikonfirmasi
    const [confirmedRows] = await pool.query<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE booking_status = 'confirmed'
    `);

    return {
      totalCustomers: Number(customerRows[0]?.total || 0),

      totalBookings: Number(bookingRows[0]?.total || 0),

      totalRefunds: Number(refundRows[0]?.total || 0),

      totalRevenue: Number(
        revenueRows[0]?.total_revenue || 0
      ),

      pendingBookings: Number(
        pendingRows[0]?.total || 0
      ),

      confirmedBookings: Number(
        confirmedRows[0]?.total || 0
      ),
    };
  }
}

export default DashboardModel;
