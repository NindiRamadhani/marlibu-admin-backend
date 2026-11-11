
import { Request, Response } from 'express';

import {
  TransportModel,
  TransportInput,
  TransportStatus,
} from '../models/transportModel';

const allowedStatuses: TransportStatus[] = [
  'available',
  'in_use',
  'maintenance',
  'inactive',
];

// Validasi data transportasi
const validateTransport = (body: any): string | null => {
  if (
    typeof body.transport_code !== 'string' ||
    !body.transport_code.trim()
  ) {
    return 'Kode transportasi wajib diisi';
  }

  if (
    typeof body.vehicle_name !== 'string' ||
    !body.vehicle_name.trim()
  ) {
    return 'Nama kendaraan wajib diisi';
  }

  if (
    typeof body.vehicle_type !== 'string' ||
    !body.vehicle_type.trim()
  ) {
    return 'Jenis kendaraan wajib diisi';
  }

  if (
    typeof body.plate_number !== 'string' ||
    !body.plate_number.trim()
  ) {
    return 'Nomor polisi wajib diisi';
  }

  if (
    !Number.isInteger(Number(body.capacity)) ||
    Number(body.capacity) <= 0
  ) {
    return 'Kapasitas harus berupa angka lebih dari 0';
  }

  const status = body.status ?? 'available';

  if (!allowedStatuses.includes(status)) {
    return 'Status harus available, in_use, maintenance, atau inactive';
  }

  const optionalFields = [
    'facilities',
    'description',
    'image_url',
  ];

  for (const field of optionalFields) {
    if (
      body[field] !== undefined &&
      body[field] !== null &&
      typeof body[field] !== 'string'
    ) {
      return `${field} harus berupa teks atau null`;
    }
  }

  return null;
};

// Menyiapkan data sebelum dikirim ke model
const prepareTransportData = (body: any): TransportInput => ({
  transport_code: body.transport_code.trim().toUpperCase(),
  vehicle_name: body.vehicle_name.trim(),
  vehicle_type: body.vehicle_type.trim(),
  plate_number: body.plate_number.trim().toUpperCase(),
  capacity: Number(body.capacity),
  facilities: body.facilities?.trim() || null,
  description: body.description?.trim() || null,
  image_url: body.image_url?.trim() || null,
  status: body.status ?? 'available',
});

// Menangani error duplikasi
const handleDatabaseError = (
  error: unknown,
  res: Response,
  defaultMessage: string
): void => {
  const dbError = error as { code?: string };

  if (dbError.code === 'ER_DUP_ENTRY') {
    res.status(409).json({
      success: false,
      message: 'Kode transportasi atau nomor polisi sudah digunakan.',
    });
    return;
  }

  console.error(defaultMessage, error);

  res.status(500).json({
    success: false,
    message: defaultMessage,
  });
};

// GET semua transportasi
export const getAllTransports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const transports = await TransportModel.getAll();

    res.status(200).json({
      success: true,
      message: 'Daftar armada transportasi berhasil diambil',
      data: transports,
    });
  } catch (error) {
    console.error('Get transports error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar transportasi',
    });
  }
};

// GET transportasi berdasarkan ID
export const getTransportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID transportasi tidak valid',
      });
      return;
    }

    const transport = await TransportModel.getById(id);

    if (!transport) {
      res.status(404).json({
        success: false,
        message: 'Data transportasi tidak ditemukan',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Detail transportasi berhasil diambil',
      data: transport,
    });
  } catch (error) {
    console.error('Get transport detail error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail transportasi',
    });
  }
};

// POST menambahkan transportasi
export const createTransport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationError = validateTransport(req.body);

    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const data = prepareTransportData(req.body);

    const transportId = await TransportModel.create(data);

    const newTransport = await TransportModel.getById(transportId);

    res.status(201).json({
      success: true,
      message: 'Transportasi berhasil ditambahkan',
      data: newTransport,
    });
  } catch (error) {
    handleDatabaseError(
      error,
      res,
      'Gagal menambahkan transportasi'
    );
  }
};

// PUT memperbarui transportasi
export const updateTransport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID transportasi tidak valid',
      });
      return;
    }

    const validationError = validateTransport(req.body);

    if (validationError) {
      res.status(400).json({
        success: false,
        message: validationError,
      });
      return;
    }

    const existing = await TransportModel.getById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Data transportasi tidak ditemukan',
      });
      return;
    }

    const data = prepareTransportData(req.body);

    await TransportModel.update(id, data);

    const updatedTransport = await TransportModel.getById(id);

    res.status(200).json({
      success: true,
      message: 'Transportasi berhasil diperbarui',
      data: updatedTransport,
    });
  } catch (error) {
    handleDatabaseError(
      error,
      res,
      'Gagal memperbarui transportasi'
    );
  }
};

// DELETE menghapus transportasi
export const deleteTransport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID transportasi tidak valid',
      });
      return;
    }

    const existing = await TransportModel.getById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        message: 'Data transportasi tidak ditemukan',
      });
      return;
    }

    await TransportModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Transportasi berhasil dihapus',
    });
  } catch (error) {
    const dbError = error as { code?: string };

    if (dbError.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(409).json({
        success: false,
        message:
          'Transportasi tidak dapat dihapus karena masih digunakan oleh jadwal perjalanan.',
      });
      return;
    }

    console.error('Delete transport error:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal menghapus transportasi',
    });
  }
};
