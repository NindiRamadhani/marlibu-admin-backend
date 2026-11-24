import pool from '../config/db';

export interface CreateBookingInput {
  booking_code: string;
  customer_id: number;
  schedule_id: number;
  created_by?: number | null;
  passenger_count?: number;
  ticket_price: number | string;
  subtotal: number | string;
  discount_amount?: number | string;
  total_amount: number | string;
  booking_status?: string;
  notes?: string | null;
}

export class BookingModel {
  // Mengambil semua booking beserta informasi pelanggan,
  // jadwal, rute, dan armada.
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT
        b.id,
        b.booking_code,
        b.customer_id,
        b.schedule_id,
        b.booking_datetime,
        b.passenger_count,
        b.ticket_price,
        b.subtotal,
        b.discount_amount,
        b.total_amount,
        b.booking_status,
        b.notes,

        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,

        s.schedule_code,
        s.departure_datetime,
        s.arrival_datetime,

        r.origin_city,
        r.destination_city,

        t.vehicle_name,
        t.vehicle_type,
        t.plate_number

      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN schedules s ON b.schedule_id = s.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN transports t ON s.transport_id = t.id

      ORDER BY b.id DESC
    `);

    return rows;
  }

  // Mengambil detail berdasarkan kode booking.
  static async getByBookingCode(bookingCode: string) {
    const [rows]: any = await pool.query(`
      SELECT
        b.id,
        b.booking_code,
        b.customer_id,
        b.schedule_id,
        b.booking_datetime,
        b.passenger_count,
        b.ticket_price,
        b.subtotal,
        b.discount_amount,
        b.total_amount,
        b.booking_status,
        b.notes,

        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,

        s.schedule_code,
        s.departure_datetime,
        s.arrival_datetime,

        r.origin_city,
        r.destination_city,

        t.vehicle_name,
        t.vehicle_type,
        t.plate_number

      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN schedules s ON b.schedule_id = s.id
      LEFT JOIN routes r ON s.route_id = r.id
      LEFT JOIN transports t ON s.transport_id = t.id

      WHERE b.booking_code = ?
      LIMIT 1
    `, [bookingCode]);

    return rows.length ? rows[0] : null;
  }

  // Menambahkan data booking baru beserta data awal pembayaran.
  static async create(data: CreateBookingInput) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result]: any = await connection.query(
        `
        INSERT INTO bookings (
          booking_code,
          customer_id,
          schedule_id,
          created_by,
          passenger_count,
          ticket_price,
          subtotal,
          discount_amount,
          total_amount,
          booking_status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.booking_code,
          data.customer_id,
          data.schedule_id,
          data.created_by ?? null,
          data.passenger_count ?? 1,
          data.ticket_price,
          data.subtotal,
          data.discount_amount ?? 0.0,
          data.total_amount,
          data.booking_status ?? 'pending',
          data.notes ?? null,
        ]
      );

      // Sesuaikan payment_method dengan pilihan ENUM di tabel `payments` kamu
      const paymentCode = `PAY-${data.booking_code}-${result.insertId}`;

      await connection.query(
        `
        INSERT INTO payments (
          payment_code,
          booking_id,
          payment_method,
          amount,
          status
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [paymentCode, result.insertId, 'bank_transfer', data.total_amount, 'pending']
      );

      await connection.commit();
      return await this.getByBookingCode(data.booking_code);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Mengubah status berdasarkan kode booking.
  static async updateStatus(
    bookingCode: string,
    status: string
  ): Promise<boolean> {
    const [result]: any = await pool.query(
      'UPDATE bookings SET booking_status = ? WHERE booking_code = ?',
      [status, bookingCode]
    );

    return result.affectedRows > 0;
  }
}