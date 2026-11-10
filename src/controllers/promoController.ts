import { Request, Response } from 'express';

export const getAllPromos = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Daftar promo berhasil diambil', data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};
