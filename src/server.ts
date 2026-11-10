
import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import { testDbConnection } from './config/db';

import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication
app.use('/api/auth', authRoutes);

// Booking
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Marlibu Travel API berjalan.',
  });
});

const PORT = Number(process.env.PORT || 5001);

const startServer = async () => {
  try {
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Gagal menjalankan server:', error);
    process.exit(1);
  }
};

startServer();
