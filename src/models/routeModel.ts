import pool from '../config/db';

export class RouteModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM routes ORDER BY id DESC');
    return rows;
  }
}