
import express from 'express';
import cors from 'cors';

import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Request Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Marlibu API is running!',
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found!',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
