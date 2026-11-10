import { Request, Response } from 'express';

export const getAllTransports = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Daftar armada transportasi berhasil diambil', data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};
