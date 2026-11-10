import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import { testDbConnection } from './config/db';

// Import semua rute dari folder routes
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

// Customer
app.use('/api/customers', customerRoutes);

// Dashboard
app.use('/api/dashboard', dashboardRoutes);

// Payment
app.use('/api/payments', paymentRoutes);

// Promo
app.use('/api/promos', promoRoutes);

// Refund
app.use('/api/refunds', refundRoutes);

// Report
app.use('/api/reports', reportRoutes);

// Route
app.use('/api/routes', routeRoutes);

// Setting
app.use('/api/settings', settingRoutes);

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