const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config/env');
const errorHandler = require('./middlewares/error.middleware');
const v1Routes = require('./routes/v1');

const app = express();

// ─── Security Middleware ──────────────────────────────
app.use(helmet());
app.use(cors({
  origin: true, // Allow any origin (Vercel domains, localhost)
  credentials: true,
}));

// ─── Rate Limiting (disabled in test) ─────────────────
if (config.nodeEnv !== 'test') {
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many login attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', generalLimiter);
  app.use('/_backend/api/', generalLimiter);
  app.use('/api/v1/auth', authLimiter);
  app.use('/_backend/api/v1/auth', authLimiter);
}

// ─── Body Parsing ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging ──────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ─── Static Files ───────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public'))); // Serve frontend from backend/public

// ─── API Routes ───────────────────────────────────────
app.use('/api/v1', v1Routes);
app.use('/_backend/api/v1', v1Routes); // For Vercel Web Services routing

// ─── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ─────────────────────────────
app.use(errorHandler);

module.exports = app;
