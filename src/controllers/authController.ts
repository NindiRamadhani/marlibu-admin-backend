
import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
      return;
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!rows.length) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
      return;
    }

    const user = rows[0];

    if (Number(user.is_active) !== 1) {
      res.status(403).json({
        success: false,
        message: 'Akun tidak aktif.',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
      return;
    }

    // Hanya admin yang boleh login ke dashboard admin
    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Akses ditolak. Akun ini bukan administrator.',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'JWT_SECRET belum dikonfigurasi.',
      });
      return;
    }

    const token = jwt.sign(
      {
        id: Number(user.id),
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '1d' }
    );

    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
    });
  }
};
