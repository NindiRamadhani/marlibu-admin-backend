import { Request, Response } from 'express';

export const getSettings = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Pengaturan sistem berhasil diambil', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};
