import pool from '../config/db';

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: string;
}

export class AuthModel {
  static async findByEmail(email: string): Promise<User | null> {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length ? (rows[0] as User) : null;
  }

  static async findById(id: number): Promise<User | null> {
    const [rows]: any = await pool.query('SELECT id, username, email, role FROM users WHERE id = ?', [id]);
    return rows.length ? (rows[0] as User) : null;
  }
}