import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// LOGIN EMAIL DAN PASSWORD
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
      [String(email).trim().toLowerCase()]
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

    if (!user.password_hash) {
      res.status(401).json({
        success: false,
        message: 'Gunakan Google Login untuk akun ini.',
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


// GOOGLE LOGIN
export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        message: 'Google ID token wajib dikirim.',
      });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const secret = process.env.JWT_SECRET;

    if (!clientId || !secret) {
      res.status(500).json({
        success: false,
        message: 'Konfigurasi Google atau JWT belum tersedia.',
      });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      res.status(401).json({
        success: false,
        message: 'Identitas Google tidak valid atau belum terverifikasi.',
      });
      return;
    }

    const email = payload.email.trim().toLowerCase();

    const [rows]: any = await pool.query(
      `SELECT id, name, email, role, is_active
       FROM users
       WHERE LOWER(email) = ?
       LIMIT 1`,
      [email]
    );

    if (!rows.length) {
      res.status(403).json({
        success: false,
        message: 'Email Google tidak terdaftar sebagai administrator.',
      });
      return;
    }

    const user = rows[0];

    if (Number(user.is_active) !== 1) {
      res.status(403).json({
        success: false,
        message: 'Akun administrator tidak aktif.',
      });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Akses ditolak. Akun ini bukan administrator.',
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
      `UPDATE users
       SET last_login_at = NOW(),
           email_verified_at = COALESCE(email_verified_at, NOW())
       WHERE id = ?`,
      [user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Google Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Verifikasi Google gagal.',
    });
  }
};


// GANTI PASSWORD
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Token tidak valid atau sesi habis.',
      });
      return;
    }

    if (!oldPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Password lama dan password baru wajib diisi.',
      });
      return;
    }

    const [rows]: any = await pool.query(
      'SELECT id, password_hash FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (!rows.length) {
      res.status(404).json({
        success: false,
        message: 'User tidak ditemukan di database.',
      });
      return;
    }

    const user = rows[0];

    if (!user.password_hash) {
      res.status(400).json({
        success: false,
        message: 'Akun ini menggunakan Google Login dan tidak memiliki password.',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: 'Password lama salah.',
      });
      return;
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Password berhasil diubah di database.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat mengubah password.',
    });
  }
};