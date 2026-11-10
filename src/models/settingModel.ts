import pool from '../config/db';

export class SettingModel {
  static async getSettings() {
    const [rows]: any = await pool.query('SELECT * FROM settings LIMIT 1');
    return rows.length ? rows[0] : null;
  }

  static async updateSettings(id: number, data: any) {
    const [result] = await pool.query('UPDATE settings SET ? WHERE id = ?', [data, id]);
    return result;
  }
}