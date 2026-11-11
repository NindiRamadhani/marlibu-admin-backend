
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface ScheduleData extends RowDataPacket {
  id: number;
  schedule_code: string;
  route_id: number;
  transport_id: number;
  departure_datetime: string;
  arrival_datetime: string | null;
  price: number;
  quota: number;
  status: 'scheduled' | 'boarding' | 'departed' | 'completed' | 'cancelled';
  notes: string | null;

  // Data tambahan dari JOIN
  route_code?: string;
  origin_city?: string;
  destination_city?: string;
  vehicle_name?: string;
  plate_number?: string;
  capacity?: number;
}

export interface ScheduleInput {
  schedule_code: string;
  route_id: number;
  transport_id: number;
  departure_datetime: string;
  arrival_datetime?: string | null;
  price: number;
  quota: number;
  status?: ScheduleData['status'];
  notes?: string | null;
}

export class ScheduleModel {

  // Mengambil semua jadwal beserta informasi rute dan kendaraan
  static async getAll(): Promise<ScheduleData[]> {
    const [rows] = await pool.query<ScheduleData[]>(`
      SELECT
        s.*,
        r.route_code,
        r.origin_city,
        r.destination_city,
        t.vehicle_name,
        t.plate_number,
        t.capacity
      FROM schedules s
      INNER JOIN routes r ON s.route_id = r.id
      INNER JOIN transports t ON s.transport_id = t.id
      ORDER BY s.id DESC
    `);

    return rows;
  }

  // Mengambil jadwal berdasarkan ID
  static async getById(id: number): Promise<ScheduleData | null> {
    const [rows] = await pool.query<ScheduleData[]>(
      `SELECT
        s.*,
        r.route_code,
        r.origin_city,
        r.destination_city,
        t.vehicle_name,
        t.plate_number,
        t.capacity
      FROM schedules s
      INNER JOIN routes r ON s.route_id = r.id
      INNER JOIN transports t ON s.transport_id = t.id
      WHERE s.id = ?
      LIMIT 1`,
      [id]
    );

    return rows[0] ?? null;
  }

  // Menambahkan jadwal
  static async create(data: ScheduleInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO schedules SET ?`,
      [data]
    );

    return result.insertId;
  }

  // Memperbarui jadwal
  static async update(
    id: number,
    data: Partial<ScheduleInput>
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE schedules SET ? WHERE id = ?`,
      [data, id]
    );

    return result.affectedRows;
  }

  // Menghapus jadwal
  static async delete(id: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM schedules WHERE id = ?`,
      [id]
    );

    return result.affectedRows;
  }

  // Mengecek apakah kode jadwal sudah digunakan
  static async isCodeExists(
    code: string,
    excludeId?: number
  ): Promise<boolean> {
    let sql = 'SELECT id FROM schedules WHERE schedule_code = ?';
    const params: (string | number)[] = [code];

    if (excludeId !== undefined) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    sql += ' LIMIT 1';

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    return rows.length > 0;
  }

  // Mengecek keberadaan rute
  static async routeExists(routeId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM routes WHERE id = ? LIMIT 1',
      [routeId]
    );

    return rows.length > 0;
  }

  // Mengecek kendaraan dan mengambil kapasitasnya
  static async getTransport(transportId: number): Promise<RowDataPacket | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, capacity, status
       FROM transports
       WHERE id = ?
       LIMIT 1`,
      [transportId]
    );

    return rows[0] ?? null;
  }
}
