import { Request, Response } from 'express';

export const getReports = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Laporan berhasil diambil', data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};
