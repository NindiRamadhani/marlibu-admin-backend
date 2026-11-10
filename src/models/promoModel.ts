
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface Promo {
  id: number;
  promo_code: string;
  promo_name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount: number | null;
  min_purchase: number;
  usage_limit: number | null;
  per_customer_limit: number | null;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'inactive' | 'expired';
  created_at?: string;
  updated_at?: string;
}

export type CreatePromo = Omit<
  Promo,
  'id' | 'created_at' | 'updated_at'
>;

export class PromoModel {

  // Mengambil semua promo
  static async getAll(): Promise<Promo[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM promos ORDER BY id DESC'
    );

    return rows as Promo[];
  }

  // Mengambil promo berdasarkan ID
  static async getById(id: number): Promise<Promo | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM promos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as Promo;
  }

  // Menambahkan promo
  static async create(data: CreatePromo): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO promos (
        promo_code,
        promo_name,
        description,
        discount_type,
        discount_value,
        max_discount,
        min_purchase,
        usage_limit,
        per_customer_limit,
        starts_at,
        ends_at,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.promo_code,
        data.promo_name,
        data.description,
        data.discount_type,
        data.discount_value,
        data.max_discount,
        data.min_purchase,
        data.usage_limit,
        data.per_customer_limit,
        data.starts_at,
        data.ends_at,
        data.status
      ]
    );

    return result.insertId;
  }

  // Memperbarui promo
  static async update(
    id: number,
    data: CreatePromo
  ): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE promos SET
        promo_code = ?,
        promo_name = ?,
        description = ?,
        discount_type = ?,
        discount_value = ?,
        max_discount = ?,
        min_purchase = ?,
        usage_limit = ?,
        per_customer_limit = ?,
        starts_at = ?,
        ends_at = ?,
        status = ?
      WHERE id = ?`,
      [
        data.promo_code,
        data.promo_name,
        data.description,
        data.discount_type,
        data.discount_value,
        data.max_discount,
        data.min_purchase,
        data.usage_limit,
        data.per_customer_limit,
        data.starts_at,
        data.ends_at,
        data.status,
        id
      ]
    );

    return result.affectedRows > 0;
  }

  // Menghapus promo
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM promos WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }
}
