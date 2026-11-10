import pool from '../config/db';

export class TransportModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM transports ORDER BY id DESC');
    return rows;
  }
}