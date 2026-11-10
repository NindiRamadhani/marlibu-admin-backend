import pool from '../config/db';

export class PaymentModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM payments ORDER BY id DESC');
    return rows;
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
  }
}