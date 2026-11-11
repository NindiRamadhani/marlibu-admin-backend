
import { Request, Response } from 'express';
import { ScheduleModel, ScheduleInput } from '../models/scheduleModel';

// GET: Mengambil semua jadwal
export const getAllSchedules = async (
  req: Request,
  res: Response
) => {
  try {
    const schedules = await ScheduleModel.getAll();

    return res.status(200).json({
      success: true,
      message: 'Daftar jadwal berhasil diambil',
      data: schedules
    });

  } catch (error) {
    console.error('Get schedules error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal'
    });
  }
};

// GET: Mengambil jadwal berdasarkan ID
export const getScheduleById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID jadwal tidak valid'
      });
    }

    const schedule = await ScheduleModel.getById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail jadwal berhasil diambil',
      data: schedule
    });

  } catch (error) {
    console.error('Get schedule detail error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail jadwal'
    });
  }
};

// POST: Menambahkan jadwal
export const createSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      schedule_code,
      route_id,
      transport_id,
      departure_datetime,
      arrival_datetime,
      price,
      quota,
      status,
      notes
    } = req.body;

    // Validasi kode jadwal
    if (
      typeof schedule_code !== 'string' ||
      !schedule_code.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Kode jadwal wajib diisi'
      });
    }

    // Validasi ID
    if (
      !Number.isSafeInteger(Number(route_id)) ||
      Number(route_id) <= 0 ||
      !Number.isSafeInteger(Number(transport_id)) ||
      Number(transport_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rute dan kendaraan wajib dipilih'
      });
    }

    // Validasi tanggal
    if (
      typeof departure_datetime !== 'string' ||
      !departure_datetime.trim() ||
      Number.isNaN(Date.parse(departure_datetime))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal keberangkatan tidak valid'
      });
    }

    if (
      arrival_datetime !== undefined &&
      arrival_datetime !== null &&
      (
        typeof arrival_datetime !== 'string' ||
        Number.isNaN(Date.parse(arrival_datetime))
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal kedatangan tidak valid'
      });
    }

    if (
      arrival_datetime &&
      new Date(arrival_datetime) <= new Date(departure_datetime)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Waktu kedatangan harus setelah keberangkatan'
      });
    }

    // Validasi harga dan kuota
    if (
      price === undefined ||
      price === null ||
      price === '' ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Harga tiket tidak valid'
      });
    }

    if (
      !Number.isSafeInteger(Number(quota)) ||
      Number(quota) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Kuota harus berupa bilangan bulat lebih dari 0'
      });
    }

    const validStatuses = [
      'scheduled',
      'boarding',
      'departed',
      'completed',
      'cancelled'
    ];

    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Status jadwal tidak valid'
      });
    }

    // Cek kode duplikat
    const code = schedule_code.trim();

    if (await ScheduleModel.isCodeExists(code)) {
      return res.status(409).json({
        success: false,
        message: 'Kode jadwal sudah digunakan'
      });
    }

    // Cek rute
    const routeExists = await ScheduleModel.routeExists(
      Number(route_id)
    );

    if (!routeExists) {
      return res.status(404).json({
        success: false,
        message: 'Rute tidak ditemukan'
      });
    }

    // Cek kendaraan
    const transport = await ScheduleModel.getTransport(
      Number(transport_id)
    );

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }

    if (transport.status === 'maintenance' ||
        transport.status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'Kendaraan sedang tidak tersedia'
      });
    }

    if (Number(quota) > Number(transport.capacity)) {
      return res.status(400).json({
        success: false,
        message: 'Kuota melebihi kapasitas kendaraan'
      });
    }

    const data: ScheduleInput = {
      schedule_code: code,
      route_id: Number(route_id),
      transport_id: Number(transport_id),
      departure_datetime,
      arrival_datetime: arrival_datetime || null,
      price: Number(price),
      quota: Number(quota),
      status: status || 'scheduled',
      notes: notes || null
    };

    const newId = await ScheduleModel.create(data);

    const newSchedule = await ScheduleModel.getById(newId);

    return res.status(201).json({
      success: true,
      message: 'Jadwal berhasil ditambahkan',
      data: newSchedule
    });

  } catch (error) {
    console.error('Create schedule error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan jadwal'
    });
  }
};

// PUT: Memperbarui jadwal
export const updateSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID jadwal tidak valid'
      });
    }

    const existing = await ScheduleModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan'
      });
    }

    const body = req.body;

    const data: Partial<ScheduleInput> = {};

    if (body.schedule_code !== undefined) {
      if (
        typeof body.schedule_code !== 'string' ||
        !body.schedule_code.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Kode jadwal tidak valid'
        });
      }

      const code = body.schedule_code.trim();

      if (await ScheduleModel.isCodeExists(code, id)) {
        return res.status(409).json({
          success: false,
          message: 'Kode jadwal sudah digunakan'
        });
      }

      data.schedule_code = code;
    }

    if (body.route_id !== undefined) {
      const routeId = Number(body.route_id);

      if (
        !Number.isSafeInteger(routeId) ||
        routeId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Rute tidak valid'
        });
      }

      if (!(await ScheduleModel.routeExists(routeId))) {
        return res.status(404).json({
          success: false,
          message: 'Rute tidak ditemukan'
        });
      }

      data.route_id = routeId;
    }

    if (body.transport_id !== undefined) {
      const transportId = Number(body.transport_id);

      if (
        !Number.isSafeInteger(transportId) ||
        transportId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Kendaraan tidak valid'
        });
      }

      data.transport_id = transportId;
    }

    const finalTransportId =
      data.transport_id ?? existing.transport_id;

    const transport = await ScheduleModel.getTransport(
      finalTransportId
    );

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }

    if (
      transport.status === 'maintenance' ||
      transport.status === 'inactive'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Kendaraan sedang tidak tersedia'
      });
    }

    if (body.departure_datetime !== undefined) {
      if (
        typeof body.departure_datetime !== 'string' ||
        !body.departure_datetime.trim() ||
        Number.isNaN(Date.parse(body.departure_datetime))
      ) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal keberangkatan tidak valid'
        });
      }

      data.departure_datetime = body.departure_datetime;
    }

    if (body.arrival_datetime !== undefined) {
      if (
        body.arrival_datetime !== null &&
        (
          typeof body.arrival_datetime !== 'string' ||
          Number.isNaN(Date.parse(body.arrival_datetime))
        )
      ) {
        return res.status(400).json({
          success: false,
          message: 'Tanggal kedatangan tidak valid'
        });
      }

      data.arrival_datetime = body.arrival_datetime;
    }

    const finalDeparture =
      data.departure_datetime ?? existing.departure_datetime;

    const finalArrival =
      data.arrival_datetime !== undefined
        ? data.arrival_datetime
        : existing.arrival_datetime;

    if (
      finalArrival &&
      new Date(finalArrival) <= new Date(finalDeparture)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Waktu kedatangan harus setelah keberangkatan'
      });
    }

    if (body.price !== undefined) {
      if (
        body.price === '' ||
        !Number.isFinite(Number(body.price)) ||
        Number(body.price) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Harga tiket tidak valid'
        });
      }

      data.price = Number(body.price);
    }

    if (body.quota !== undefined) {
      if (
        !Number.isSafeInteger(Number(body.quota)) ||
        Number(body.quota) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Kuota tidak valid'
        });
      }

      data.quota = Number(body.quota);
    }

    const finalQuota = data.quota ?? existing.quota;

    if (finalQuota > Number(transport.capacity)) {
      return res.status(400).json({
        success: false,
        message: 'Kuota melebihi kapasitas kendaraan'
      });
    }

    if (body.status !== undefined) {
      const validStatuses = [
        'scheduled',
        'boarding',
        'departed',
        'completed',
        'cancelled'
      ];

      if (!validStatuses.includes(body.status)) {
        return res.status(400).json({
          success: false,
          message: 'Status jadwal tidak valid'
        });
      }

      data.status = body.status;
    }

    if (body.notes !== undefined) {
      data.notes = body.notes || null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diperbarui'
      });
    }

    await ScheduleModel.update(id, data);

    const updated = await ScheduleModel.getById(id);

    return res.status(200).json({
      success: true,
      message: 'Jadwal berhasil diperbarui',
      data: updated
    });

  } catch (error) {
    console.error('Update schedule error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui jadwal'
    });
  }
};

// DELETE: Menghapus jadwal
export const deleteSchedule = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID jadwal tidak valid'
      });
    }

    const existing = await ScheduleModel.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan'
      });
    }

    await ScheduleModel.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Jadwal berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete schedule error:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus jadwal'
    });
  }
};
