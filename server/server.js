/**
 * MedulloSight — Express API Gateway Server
 * Orchestrates requests between React client, MongoDB, and Python Scientific Service.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Global Error Handler (Sanitizes errors, prevents raw leak)
app.use((err, req, res, next) => {
  console.error('[Gateway Exception]', err.message);
  res.status(err.status || 500).json({
    error: 'Internal Gateway Error',
    message: err.message || 'An unexpected error occurred during request processing.'
  });
});

// Initialize database and start listening
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Express Gateway] MedulloSight server active on http://127.0.0.1:${PORT}`);
  });
}

startServer();
