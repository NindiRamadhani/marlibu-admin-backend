
import pool from '../config/db';

export class PaymentModel {
  // Mengambil semua data pembayaran
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM payments ORDER BY id DESC'
    );

    return rows;
  }

  // Mengambil detail pembayaran berdasarkan ID
  static async getById(id: number) {
    const [rows]: any = await pool.query(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );

    return rows.length ? rows[0] : null;
  }

  // Mengubah status pembayaran
  static async updateStatus(
    id: number,
    status: string
  ): Promise<boolean> {
    const [result]: any = await pool.query(
      'UPDATE payments SET status = ? WHERE id = ?',
      [status, id]
    );

    return result.affectedRows > 0;
  }
}
