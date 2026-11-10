import { Request, Response } from 'express';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Statistik dashboard berhasil diambil', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};
