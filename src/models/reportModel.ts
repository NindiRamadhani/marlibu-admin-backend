import pool from '../config/db';

export class ReportModel {
  static async getTransactionReport() {
    // Mengambil data laporan transaksi dengan kolom yang valid dari tabel bookings
    const query = `
      SELECT id, booking_code, total_amount, booking_status, created_at 
      FROM bookings 
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }
}