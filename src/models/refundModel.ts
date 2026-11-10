import pool from '../config/db';

export interface RefundItem {
  id?: number;
  idBooking: string;
  nama: string;
  bank: string;
  rekening: string;
  email: string;
  telepon: string;
  tglPengajuan: string;
  alasan: string;
  catatan?: string;
  hargaAsli: number;
  potongan: number;
  nominalRefund: number;
  status: 'Proses' | 'Selesai' | 'Ditolak';
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

  static async create(data: Omit<RefundItem, 'id'>) {
    const query = `
      INSERT INTO refunds 
      (idBooking, nama, bank, rekening, email, telepon, tglPengajuan, alasan, catatan, hargaAsli, potongan, nominalRefund, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      data.idBooking,
      data.nama,
      data.bank,
      data.rekening,
      data.email,
      data.telepon,
      data.tglPengajuan,
      data.alasan,
      data.catatan || '',
      data.hargaAsli,
      data.potongan,
      data.nominalRefund,
      data.status || 'Proses',
    ]);
    return result;
  }

  static async updateStatus(id: number, status: 'Proses' | 'Selesai' | 'Ditolak') {
    const [result] = await pool.query('UPDATE refunds SET status = ? WHERE id = ?', [status, id]);
    return result;
  }
}