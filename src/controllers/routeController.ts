
import { Request, Response } from 'express';
import { RouteModel } from '../models/routeModel';

// GET semua rute
export const getAllRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await RouteModel.getAll();

    return res.status(200).json({
      success: true,
      message: 'Daftar rute perjalanan berhasil diambil',
      data: routes,
    });
  } catch (error) {
    console.error('Get routes error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data rute perjalanan',
    });
  }
};

// GET detail rute
export const getRouteById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID rute tidak valid',
      });
    }

    const route = await RouteModel.getById(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Data rute tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail rute berhasil diambil',
      data: route,
    });
  } catch (error) {
    console.error('Get route error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail rute',
    });
  }
};

// POST tambah rute
export const createRoute = async (req: Request, res: Response) => {
  try {
    const {
      route_code,
      origin_city,
      origin_address,
      destination_city,
      destination_address,
      estimated_duration_minutes,
      distance_km,
      description,
      is_active,
    } = req.body;

    // Validasi field wajib
    if (
      !route_code?.trim() ||
      !origin_city?.trim() ||
      !destination_city?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Kode rute, kota asal, dan kota tujuan wajib diisi',
      });
    }

    const duration =
      estimated_duration_minutes === '' ||
      estimated_duration_minutes == null
        ? null
        : Number(estimated_duration_minutes);

    const distance =
      distance_km === '' || distance_km == null
        ? null
        : Number(distance_km);

    if (
      duration !== null &&
      (!Number.isInteger(duration) || duration < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Durasi harus berupa angka bulat positif',
      });
    }

    if (
      distance !== null &&
      (!Number.isFinite(distance) || distance < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Jarak harus berupa angka positif',
      });
    }

    if (
      is_active !== undefined &&
      ![0, 1, true, false].includes(is_active)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Status aktif harus berupa 0 atau 1',
      });
    }

    const data = {
      route_code: route_code.trim().toUpperCase(),
      origin_city: origin_city.trim(),
      origin_address: origin_address?.trim() || null,
      destination_city: destination_city.trim(),
      destination_address: destination_address?.trim() || null,
      estimated_duration_minutes: duration,
      distance_km: distance,
      description: description?.trim() || null,
      is_active: is_active === undefined ? 1 : Number(is_active),
    };

    const insertId = await RouteModel.create(data);

    return res.status(201).json({
      success: true,
      message: 'Rute perjalanan berhasil ditambahkan',
      data: {
        id: insertId,
      },
    });
  } catch (error) {
    console.error('Create route error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan rute perjalanan',
    });
  }
};

// PUT edit rute
export const updateRoute = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID rute tidak valid',
      });
    }

    const allowedFields = [
      'route_code',
      'origin_city',
      'origin_address',
      'destination_city',
      'destination_address',
      'estimated_duration_minutes',
      'distance_km',
      'description',
      'is_active',
    ];

    const data: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diperbarui',
      });
    }

    const existing = await RouteModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Data rute tidak ditemukan',
      });
    }

    if ('route_code' in data) {
      if (typeof data.route_code !== 'string' || !data.route_code.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Kode rute tidak boleh kosong',
        });
      }
      data.route_code = data.route_code.trim().toUpperCase();
    }

    for (const field of ['origin_city', 'destination_city']) {
      if (field in data) {
        if (typeof data[field] !== 'string' || !data[field].trim()) {
          return res.status(400).json({
            success: false,
            message: `${field} tidak boleh kosong`,
          });
        }
        data[field] = (data[field] as string).trim();
      }
    }

    if ('estimated_duration_minutes' in data) {
      const value = Number(data.estimated_duration_minutes);
      if (!Number.isInteger(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: 'Durasi tidak valid',
        });
      }
      data.estimated_duration_minutes = value;
    }

    if ('distance_km' in data) {
      const value = Number(data.distance_km);
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({
          success: false,
          message: 'Jarak tidak valid',
        });
      }
      data.distance_km = value;
    }

    if ('is_active' in data) {
      if (![0, 1, true, false].includes(data.is_active as number | boolean)) {
        return res.status(400).json({
          success: false,
          message: 'Status aktif tidak valid',
        });
      }
      data.is_active = Number(data.is_active);
    }

    for (const field of ['origin_address', 'destination_address', 'description']) {
      if (field in data && typeof data[field] === 'string') {
        data[field] = (data[field] as string).trim() || null;
      }
    }

    await RouteModel.update(id, data);

    return res.status(200).json({
      success: true,
      message: 'Rute perjalanan berhasil diperbarui',
    });
  } catch (error) {
    console.error('Update route error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui rute perjalanan',
    });
  }
};

// DELETE rute
export const deleteRoute = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID rute tidak valid',
      });
    }

    const affectedRows = await RouteModel.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data rute tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rute perjalanan berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete route error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus rute perjalanan',
    });
  }
};
