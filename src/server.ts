
import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import { testDbConnection } from './config/db';

// Import Routes
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import customerRoutes from './routes/customerRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import paymentRoutes from './routes/paymentRoutes';
import promoRoutes from './routes/promoRoutes';
import refundRoutes from './routes/refundRoutes';
import reportRoutes from './routes/reportRoutes';
import routeRoutes from './routes/routeRoutes';
import settingRoutes from './routes/settingRoutes';
import transportRoutes from './routes/transportRoutes';
import scheduleRoutes from './routes/scheduleRoutes';

const app = express();

// Middleware CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Middleware Request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/transports', transportRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Marlibu Travel API berjalan.',
  });
});

// Handle Route Not Found
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint API tidak ditemukan.',
  });
});

// Global Error Handler
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Server Error:', error);

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    });
  }
);

// Port Server
const PORT = Number(process.env.PORT || 5001);

// Start Server
const startServer = async () => {
  try {
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
      console.log('API Transport: http://localhost:' + PORT + '/api/transports');
    });
  } catch (error) {
    console.error('Gagal menjalankan server:', error);
    process.exit(1);
  }
};

startServer();
