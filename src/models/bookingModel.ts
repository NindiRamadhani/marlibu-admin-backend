import pool from '../config/db';

export interface Booking {
  id?: number;
  idBooking: string;
  customerId: number;
  tglBooking: string;
  totalBayar: number;
  status: string;
}

export class BookingModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM bookings ORDER BY id DESC');
    return rows;
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
  }

  static async create(data: Omit<Booking, 'id'>) {
    const [result] = await pool.query(
      'INSERT INTO bookings (idBooking, customerId, tglBooking, totalBayar, status) VALUES (?, ?, ?, ?, ?)',
      [data.idBooking, data.customerId, data.tglBooking, data.totalBayar, data.status]
    );
    return result;
  }
}