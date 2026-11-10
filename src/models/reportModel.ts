import pool from '../config/db';

export class ReportModel {
  static async getTransactionReport() {
    const [rows] = await pool.query('SELECT * FROM reports ORDER BY id DESC');
    return rows;
  }
}