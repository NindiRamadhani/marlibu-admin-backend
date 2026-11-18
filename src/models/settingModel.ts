import pool from '../config/db';

export class UserModel {
    // Cari user berdasarkan ID
    static async findById(id: number) {
        const [rows]: any = await pool.query('SELECT * FROM id, username, password FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    // Update password baru (pastikan sudah di-hash pakai bcrypt di controller)
    static async updatePassword(id: number, hashedPassword: string) {
        const [result] = await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
        return result;
    }
}