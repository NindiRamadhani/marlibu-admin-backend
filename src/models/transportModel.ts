
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';

export type TransportStatus =
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'inactive';

export interface Transport extends RowDataPacket {
  id: number;
  transport_code: string;
  vehicle_name: string;
  vehicle_type: string;
  plate_number: string;
  capacity: number;
  facilities: string | null;
  description: string | null;
  image_url: string | null;
  status: TransportStatus;
  created_at: Date;
  updated_at: Date;
}

export interface TransportInput {
  transport_code: string;
  vehicle_name: string;
  vehicle_type: string;
  plate_number: string;
  capacity: number;
  facilities: string | null;
  description: string | null;
  image_url: string | null;
  status: TransportStatus;
}

export class TransportModel {
  // Mengambil semua data transportasi
  static async getAll(): Promise<Transport[]> {
    const [rows] = await pool.query<Transport[]>(
      'SELECT * FROM transports ORDER BY id DESC'
    );

    return rows;
  }

  // Mengambil transportasi berdasarkan ID
  static async getById(id: number): Promise<Transport | null> {
    const [rows] = await pool.query<Transport[]>(
      'SELECT * FROM transports WHERE id = ? LIMIT 1',
      [id]
    );

    return rows[0] ?? null;
  }

  // Menambahkan transportasi
  static async create(data: TransportInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO transports (
        transport_code,
        vehicle_name,
        vehicle_type,
        plate_number,
        capacity,
        facilities,
        description,
        image_url,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.transport_code,
        data.vehicle_name,
        data.vehicle_type,
        data.plate_number,
        data.capacity,
        data.facilities,
        data.description,
        data.image_url,
        data.status,
      ]
    );

    return result.insertId;
  }

  // Memperbarui transportasi
  static async update(
    id: number,
    data: TransportInput
  ): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE transports SET
        transport_code = ?,
        vehicle_name = ?,
        vehicle_type = ?,
        plate_number = ?,
        capacity = ?,
        facilities = ?,
        description = ?,
        image_url = ?,
        status = ?
      WHERE id = ?`,
      [
        data.transport_code,
        data.vehicle_name,
        data.vehicle_type,
        data.plate_number,
        data.capacity,
        data.facilities,
        data.description,
        data.image_url,
        data.status,
        id,
      ]
    );

    return result.affectedRows > 0;
  }

  // Menghapus transportasi
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM transports WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }
}

export default TransportModel;
