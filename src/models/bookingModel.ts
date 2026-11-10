
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
  // Mengambil semua data booking
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM bookings ORDER BY id DESC'
    );

    return rows;
  }

  // Mengambil detail booking berdasarkan ID
  static async getById(id: number) {
    const [rows]: any = await pool.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    return rows.length ? rows[0] : null;
  }

  // Menambahkan data booking baru
  static async create(data: Omit<Booking, 'id'>) {
    const [result] = await pool.query(
      `INSERT INTO bookings
      (idBooking, customerId, tglBooking, totalBayar, status)
      VALUES (?, ?, ?, ?, ?)`,
      [
        data.idBooking,
        data.customerId,
        data.tglBooking,
        data.totalBayar,
        data.status
      ]
    );

    return result;
  }

  // Mengubah status booking
  static async updateStatus(
    id: number,
    status: string
  ): Promise<boolean> {
    const [result]: any = await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );

    return result.affectedRows > 0;
  }
}
