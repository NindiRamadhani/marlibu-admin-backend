import { Request, Response } from 'express';

export const getAllRefunds = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Daftar refund berhasil diambil', data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};
