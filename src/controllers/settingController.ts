import { Request, Response } from 'express';
import { SettingModel } from '../models/settingModel';

export class SettingController {
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await SettingModel.getSettings();
      res.json({ 
        success: true, 
        message: 'Pengaturan sistem berhasil diambil', 
        data: settings || {} 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Gagal memuat pengaturan', error });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      await SettingModel.updateSettings(Number(id), data);
      res.json({ 
        success: true, 
        message: 'Pengaturan berhasil diperbarui' 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan', error });
    }
  }
}