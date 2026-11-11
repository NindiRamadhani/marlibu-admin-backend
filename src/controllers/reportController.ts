import { Request, Response } from 'express';
import { ReportModel } from '../models/reportModel';

export const getReports = async (req: Request, res: Response) => {
  try {
    // Panggil data dari model laporan
    const reports = await ReportModel.getTransactionReport();
    
    res.json({ 
      success: true, 
      message: 'Laporan berhasil diambil', 
      data: reports 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error server', error });
  }
};