
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Interface data rute
export interface RouteData extends RowDataPacket {
  id: number;
  [key: string]: unknown;
}

export class RouteModel {

  // ==========================================
  // GET: Mengambil seluruh data rute
  // ==========================================
  static async getAll(): Promise<RouteData[]> {
    const [rows] = await pool.query(
      'SELECT * FROM routes ORDER BY id DESC'
    );

    return rows as RouteData[];
  }

  // ==========================================
  // GET: Mengambil rute berdasarkan ID
  // ==========================================
  static async getById(id: number): Promise<RouteData | null> {
    const [rows] = await pool.query(
      'SELECT * FROM routes WHERE id = ? LIMIT 1',
      [id]
    );

    const routes = rows as RouteData[];

    // Menghindari error TypeScript TS2322
    return routes[0] ?? null;
  }

  // ==========================================
  // POST: Menambahkan data rute
  // ==========================================
  static async create(
    data: Record<string, unknown>
  ): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO routes SET ?',
      [data]
    );

    return (result as ResultSetHeader).insertId;
  }

  // ==========================================
  // PUT: Memperbarui data rute
  // ==========================================
  static async update(
    id: number,
    data: Record<string, unknown>
  ): Promise<number> {
    const [result] = await pool.query(
      'UPDATE routes SET ? WHERE id = ?',
      [data, id]
    );

    return (result as ResultSetHeader).affectedRows;
  }

  // ==========================================
  // DELETE: Menghapus data rute
  // ==========================================
  static async delete(id: number): Promise<number> {
    const [result] = await pool.query(
      'DELETE FROM routes WHERE id = ?',
      [id]
    );

    return (result as ResultSetHeader).affectedRows;
  }
}

// Export default
export default RouteModel;
