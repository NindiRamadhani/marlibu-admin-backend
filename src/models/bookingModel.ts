
import pool from '../config/db';

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
