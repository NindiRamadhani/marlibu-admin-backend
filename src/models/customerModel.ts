import pool from '../config/db';

export interface Customer {
  id?: number;
  nama: string;
  email: string;
  telepon: string;
  alamat?: string;
}

export class CustomerModel {
  static async getAll(): Promise<Customer[]> {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
    return rows as Customer[];
  }

  static async getById(id: number): Promise<Customer | null> {
    const [rows]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    return rows.length ? (rows[0] as Customer) : null;
  }

  static async create(data: Omit<Customer, 'id'>) {
    const [result] = await pool.query(
      'INSERT INTO customers (nama, email, telepon, alamat) VALUES (?, ?, ?, ?)',
      [data.nama, data.email, data.telepon, data.alamat || '']
    );
    return result;
  }
}