
import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marlibu_travel',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testDbConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();

    console.log('MySQL database connected successfully!');

    connection.release();
  } catch (error) {
    console.error('MySQL connection failed:', error);
    throw error;
  }
}

export default pool;