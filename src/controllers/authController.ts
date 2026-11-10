import { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Login berhasil' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Registrasi berhasil' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};
