import pool from '../config/db';

export interface Promo {
  id?: number;
  kodePromo: string;
  diskon: number;
  berlakuHingga: string;
  status: 'Aktif' | 'Nonaktif';
}

export class PromoModel {
  static async getAll(): Promise<Promo[]> {
    const [rows] = await pool.query('SELECT * FROM promos ORDER BY id DESC');
    return rows as Promo[];
  }

  static async create(data: Omit<Promo, 'id'>) {
    const [result] = await pool.query(
      'INSERT INTO promos (kodePromo, diskon, berlakuHingga, status) VALUES (?, ?, ?, ?)',
      [data.kodePromo, data.diskon, data.berlakuHingga, data.status]
    );
    return result;
  }
}