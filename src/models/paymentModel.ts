
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';

export interface PaymentRow extends RowDataPacket {
  id: number;
  payment_code: string;
  booking_id: number;
  payment_method: string;
  amount: number;
  payment_date: string | null;
  proof_url: string | null;
  transaction_reference: string | null;
  status: string;
  verified_by: number | null;
  verified_at: string | null;
  admin_note: string | null;
}

export interface CreatePaymentData {
  payment_code: string;
  booking_id: number;
  payment_method:
    | 'bank_transfer'
    | 'cash'
    | 'qris'
    | 'e_wallet'
    | 'credit_card'
    | 'other';
  amount: number;
  payment_date?: string | null;
  proof_url?: string | null;
  transaction_reference?: string | null;
}

export class PaymentModel {
  static async getAll(): Promise<PaymentRow[]> {
    const [rows] = await pool.query<PaymentRow[]>(
      'SELECT * FROM payments ORDER BY id DESC'
    );

    return rows;
  }

  static async getById(id: number): Promise<PaymentRow | null> {
    const [rows] = await pool.query<PaymentRow[]>(
      'SELECT * FROM payments WHERE id = ? LIMIT 1',
      [id]
    );

    return rows.length > 0 ? rows[0] ?? null : null;
  }

  static async create(data: CreatePaymentData): Promise<number> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Pastikan booking tersedia
      const [bookingRows] = await connection.query<RowDataPacket[]>(
        'SELECT id, total_amount FROM bookings WHERE id = ? LIMIT 1',
        [data.booking_id]
      );

      if (bookingRows.length === 0) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      const [existingPayments] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM payments
         WHERE booking_id = ?
         AND status IN ('pending', 'verified')
         LIMIT 1`,
        [data.booking_id]
      );

      if (existingPayments.length > 0) {
        throw new Error('PAYMENT_ALREADY_EXISTS');
      }

      const booking = bookingRows[0];

      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      if (Number(data.amount) !== Number(booking.total_amount)) {
        throw new Error('PAYMENT_AMOUNT_MISMATCH');
      }

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO payments (
          payment_code,
          booking_id,
          payment_method,
          amount,
          payment_date,
          proof_url,
          transaction_reference,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          data.payment_code,
          data.booking_id,
          data.payment_method,
          data.amount,
          data.payment_date ?? null,
          data.proof_url ?? null,
          data.transaction_reference ?? null,
        ]
      );

      await connection.commit();

      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateStatus(
    id: number,
    status: 'pending' | 'verified' | 'rejected',
    adminId?: number,
    adminNote: string | null = null
  ): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE payments
       SET status = ?,
           verified_by = ?,
           verified_at = CASE
             WHEN ? = 'pending' THEN NULL
             ELSE NOW()
           END,
           admin_note = ?
       WHERE id = ?
       AND status = 'pending'`,
      [status, status === 'pending' ? null : adminId ?? null, status, adminNote, id]
    );

    return result.affectedRows > 0;
  }
}

export default PaymentModel;
