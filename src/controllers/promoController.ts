
import { Request, Response } from 'express';
import { PromoModel, CreatePromo } from '../models/promoModel';

// Validasi data promo
const validatePromo = (data: any): string | null => {
  const {
    promo_code,
    promo_name,
    discount_type,
    discount_value,
    starts_at,
    ends_at,
    status,
    min_purchase,
  } = data;

  if (
    !promo_code ||
    typeof promo_code !== 'string' ||
    !promo_name ||
    typeof promo_name !== 'string'
  ) {
    return 'Kode promo dan nama promo wajib diisi';
  }

  if (!['percentage', 'fixed'].includes(discount_type)) {
    return 'Tipe diskon harus percentage atau fixed';
  }

  if (
    discount_value === undefined ||
    !Number.isFinite(Number(discount_value)) ||
    Number(discount_value) <= 0
  ) {
    return 'Nilai diskon harus lebih dari 0';
  }

  if (
    discount_type === 'percentage' &&
    Number(discount_value) > 100
  ) {
    return 'Diskon persentase maksimal 100';
  }

  if (!starts_at || !ends_at) {
    return 'Tanggal mulai dan tanggal berakhir wajib diisi';
  }

  if (new Date(ends_at) <= new Date(starts_at)) {
    return 'Tanggal berakhir harus setelah tanggal mulai';
  }

  if (
    !['active', 'inactive', 'expired'].includes(status)
  ) {
    return 'Status promo tidak valid';
  }

  if (
    min_purchase !== undefined &&
    (!Number.isFinite(Number(min_purchase)) ||
      Number(min_purchase) < 0)
  ) {
    return 'Minimum pembelian tidak valid';
  }

  return null;
};

// Mengambil semua promo
export const getAllPromos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const promos = await PromoModel.getAll();

    res.status(200).json({
      success: true,
      message: 'Daftar promo berhasil diambil',
      data: promos,
    });
  } catch (error) {
    console.error('Get all promos error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar promo',
    });
  }
};

// Mengambil promo berdasarkan ID
export const getPromoById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID promo tidak valid',
      });
      return;
    }

    const promo = await PromoModel.getById(id);

    if (!promo) {
      res.status(404).json({
        success: false,
        message: 'Promo tidak ditemukan',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Detail promo berhasil diambil',
      data: promo,
    });
  } catch (error) {
    console.error('Get promo by ID error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail promo',
    });
  }
};

// Menambahkan promo
export const createPromo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationError = validatePromo(req.body);

    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const data: CreatePromo = {
      promo_code: req.body.promo_code.trim(),
      promo_name: req.body.promo_name.trim(),
      description: req.body.description?.trim() || null,
      discount_type: req.body.discount_type,
      discount_value: Number(req.body.discount_value),
      max_discount:
        req.body.max_discount == null
          ? null
          : Number(req.body.max_discount),
      min_purchase: Number(req.body.min_purchase ?? 0),
      usage_limit:
        req.body.usage_limit == null
          ? null
          : Number(req.body.usage_limit),
      per_customer_limit:
        req.body.per_customer_limit == null
          ? null
          : Number(req.body.per_customer_limit),
      starts_at: req.body.starts_at,
      ends_at: req.body.ends_at,
      status: req.body.status,
    };

    if (
      data.max_discount !== null &&
      (!Number.isFinite(data.max_discount) || data.max_discount < 0)
    ) {
      res.status(400).json({
        success: false,
        message: 'Maksimal diskon tidak valid',
      });
      return;
    }

    const promoId = await PromoModel.create(data);

    res.status(201).json({
      success: true,
      message: 'Promo berhasil ditambahkan',
      data: { id: promoId },
    });
  } catch (error: any) {
    console.error('Create promo error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Kode promo sudah digunakan',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan promo',
    });
  }
};

// Mengubah promo
export const updatePromo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID promo tidak valid',
      });
      return;
    }

    const existingPromo = await PromoModel.getById(id);

    if (!existingPromo) {
      res.status(404).json({
        success: false,
        message: 'Promo tidak ditemukan',
      });
      return;
    }

    const validationError = validatePromo(req.body);

    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const data: CreatePromo = {
      promo_code: req.body.promo_code.trim(),
      promo_name: req.body.promo_name.trim(),
      description: req.body.description?.trim() || null,
      discount_type: req.body.discount_type,
      discount_value: Number(req.body.discount_value),
      max_discount:
        req.body.max_discount == null
          ? null
          : Number(req.body.max_discount),
      min_purchase: Number(req.body.min_purchase ?? 0),
      usage_limit:
        req.body.usage_limit == null
          ? null
          : Number(req.body.usage_limit),
      per_customer_limit:
        req.body.per_customer_limit == null
          ? null
          : Number(req.body.per_customer_limit),
      starts_at: req.body.starts_at,
      ends_at: req.body.ends_at,
      status: req.body.status,
    };

    const updated = await PromoModel.update(id, data);

    if (!updated) {
      res.status(400).json({
        success: false,
        message: 'Promo gagal diperbarui',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Promo berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Update promo error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Kode promo sudah digunakan',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui promo',
    });
  }
};

// Menghapus promo
export const deletePromo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID promo tidak valid',
      });
      return;
    }

    const existingPromo = await PromoModel.getById(id);

    if (!existingPromo) {
      res.status(404).json({
        success: false,
        message: 'Promo tidak ditemukan',
      });
      return;
    }

    const deleted = await PromoModel.delete(id);

    if (!deleted) {
      res.status(400).json({
        success: false,
        message: 'Promo gagal dihapus',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Promo berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete promo error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal menghapus promo',
    });
  }
};
