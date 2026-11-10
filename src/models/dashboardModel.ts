import pool from '../config/db';

export class DashboardModel {
  static async getSummaryStats() {
    const [customers]: any = await pool.query('SELECT COUNT(*) as totalCustomer FROM customers');
    const [bookings]: any = await pool.query('SELECT COUNT(*) as totalBooking FROM bookings');
    const [refunds]: any = await pool.query('SELECT COUNT(*) as totalRefund FROM refunds');

    return {
      totalCustomer: customers[0].totalCustomer,
      totalBooking: bookings[0].totalBooking,
      totalRefund: refunds[0].totalRefund,
    };
  }
}