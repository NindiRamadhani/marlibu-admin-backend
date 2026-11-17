
import pool from '../config/db';

export interface BookingHistory {
  idBooking: string;
  rute: string;
  tanggal: string;
  totalHarga: number;
  status: 'Selesai' | 'Proses' | 'Dibatalkan';
}

export interface Customer {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  totalBooking: number;
  riwayatBooking: BookingHistory[];
}

function mapBookingStatus(status: string): BookingHistory['status'] {
  switch (status) {
    case 'completed':
      return 'Selesai';
    case 'cancelled':
    case 'refunded':
      return 'Dibatalkan';
    default:
      return 'Proses';
  }
}

export class CustomerModel {
  static async getAll(): Promise<Customer[]> {
    const [customerRows]: any = await pool.query(`
      SELECT
        c.id,
        c.name AS nama,
        c.email,
        c.phone AS telepon,
        COUNT(b.id) AS totalBooking
      FROM customers c
      LEFT JOIN bookings b ON b.customer_id = c.id
      GROUP BY c.id, c.name, c.email, c.phone
      ORDER BY c.id DESC
    `);

    const [bookingRows]: any = await pool.query(`
      SELECT
        b.customer_id,
        b.booking_code AS idBooking,
        CONCAT(
          COALESCE(r.origin_city, '-'),
          ' - ',
          COALESCE(r.destination_city, '-')
        ) AS rute,
        DATE_FORMAT(s.departure_datetime, '%Y-%m-%d') AS tanggal,
        b.total_amount AS totalHarga,
        b.booking_status AS status
      FROM bookings b
      LEFT JOIN schedules s ON s.id = b.schedule_id
      LEFT JOIN routes r ON r.id = s.route_id
      ORDER BY b.booking_datetime DESC
    `);

    return customerRows.map((customer: any) => ({
      ...customer,
      id: Number(customer.id),
      totalBooking: Number(customer.totalBooking),
      riwayatBooking: bookingRows
        .filter((booking: any) =>
          Number(booking.customer_id) === Number(customer.id)
        )
        .map((booking: any) => ({
          idBooking: booking.idBooking,
          rute: booking.rute,
          tanggal: booking.tanggal,
          totalHarga: Number(booking.totalHarga),
          status: mapBookingStatus(booking.status),
        })),
    }));
  }

  static async getById(id: number): Promise<Customer | null> {
    const customers = await this.getAll();

    return customers.find(
      (customer) => customer.id === id
    ) || null;
  }

  static async delete(id: number): Promise<boolean> {
    const [bookingRows]: any = await pool.query(
      'SELECT COUNT(*) AS total FROM bookings WHERE customer_id = ?',
      [id]
    );

    if (Number(bookingRows[0].total) > 0) {
      throw new Error('CUSTOMER_HAS_BOOKINGS');
    }

    const [result]: any = await pool.query(
      'DELETE FROM customers WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }
}
