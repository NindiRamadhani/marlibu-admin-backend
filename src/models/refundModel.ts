import pool from '../config/db';

export interface RefundItem {
  id?: number;
  refund_code?: string;
  booking_id: number;
  payment_id?: number | null;
  requested_amount: number;
  deduction_amount?: number;
  refund_amount: number;
  reason: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'processed';
  admin_note?: string;
  processed_by?: number | null;
}

export class RefundModel {
  static async getAll(): Promise<RefundItem[]> {
    const [rows] = await pool.query('SELECT * FROM refunds ORDER BY id DESC');
    return rows as RefundItem[];
  }

  static async getById(id: number): Promise<RefundItem | null> {
    const [rows]: any = await pool.query('SELECT * FROM refunds WHERE id = ?', [id]);
    return rows.length ? (rows[0] as RefundItem) : null;
  }

  static async create(data: Omit<RefundItem, 'id' | 'created_at' | 'updated_at'>) {
    const query = `
      INSERT INTO refunds 
      (refund_code, booking_id, payment_id, requested_amount, deduction_amount, refund_amount, reason, bank_name, bank_account_number, bank_account_name, status, admin_note, processed_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      data.refund_code || `REF-${Date.now()}`,
      data.booking_id,
      data.payment_id || null,
      data.requested_amount,
      data.deduction_amount || 0,
      data.refund_amount,
      data.reason,
      data.bank_name || null,
      data.bank_account_number || null,
      data.bank_account_name || null,
      data.status || 'pending',
      data.admin_note || null,
      data.processed_by || null,
    ]);
    return result;
  }

  static async updateStatus(id: number, status: 'pending' | 'approved' | 'rejected' | 'processed', admin_note?: string) {
    const query = `UPDATE refunds SET status = ?, admin_note = ? WHERE id = ?`;
    const [result] = await pool.query(query, [status, admin_note || null, id]);
    return result;
  }
}