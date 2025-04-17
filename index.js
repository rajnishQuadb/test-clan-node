import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import session from 'express-session';
import passport from 'passport';
import twitterAuth from './config/twitterAuth.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Route imports
import userRoutes from './routes/users.js';
import campaignRoutes from './routes/campaigns.js';
import leaderboardRoutes from './routes/leaderboards.js';

dotenv.config();

// Define color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  fg: {
    black: "\x1b[30m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  },
  bg: {
    red: "\x1b[41m",
    green: "\x1b[42m",
    blue: "\x1b[44m",
  }
};

// Set up express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));  // Simple logging middleware

// Setup logging with colors
const methodColors = {
  'GET': colors.green,
  'POST': colors.yellow,
  'PUT': colors.blue,
  'DELETE': colors.red,
  'PATCH': colors.cyan,
};

app.use((req, res, next) => {
  const methodColor = methodColors[req.method] || colors.white;
  const timestamp = new Date().toISOString();

  console.log(`${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║ ${colors.magenta}${timestamp}${colors.reset} ║`);
  
  console.log(`${colors.cyan}╠════════════════════════════════════════════════════╣${colors.reset}`);

  // Log request details
  console.log(`${colors.cyan}║ ${methodColor}${req.method} ${req.originalUrl}${colors.reset} ║`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`${colors.cyan}║ Request Body: ${JSON.stringify(req.body, null, 2)} ${colors.reset} ║`);
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`${colors.cyan}║ Query Parameters: ${JSON.stringify(req.query, null, 2)} ${colors.reset} ║`);
  }
  
  next();
});

// Error handling middleware should be last
app.use((err, req, res, next) => {
  console.error(`${colors.bg.red}${colors.fg.white} ERROR ${colors.reset} ${colors.fg.red}${err.stack}${colors.reset}`);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check and root routes
app.get('/', (req, res) => res.send('KILT Social Auth API is running...'));
app.get('/api', (req, res) => res.status(200).json({ success: true, message: 'API is running...' }));
app.get('/api/health-check', (req, res) => res.status(200).json({ success: true, message: 'Server is healthy' }));

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
// Routes
app.get('/privacyPolicy', (req, res) => {
  res.sendFile(path.join(__dirname, 'htmlPages/privacyPolicy.html'));
});

app.get('/termsOfService', (req, res) => {
  res.sendFile(path.join(__dirname, 'htmlPages/termsOfService.html'));
});
// Twitter authentication and session setup
app.use(session({
  secret: 'TWITTER_AUTH_SECRET_KEY',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// Twitter auth route
app.use('/auth/twitter', twitterAuth);

// Start server and connect to DB
const PORT = process.env.PORT || 8000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n${colors.fg.cyan}${colors.bright}╔═════════════════════════════════════════════════════════════════╗${colors.reset}`);
            console.log(`${colors.fg.cyan}║${colors.reset} ${colors.bright}${colors.fg.white}             KILT Social Auth Backend Server                ${colors.reset}${colors.fg.cyan} ║${colors.reset}`);
            console.log(`${colors.fg.cyan}╠═════════════════════════════════════════════════════════════════╣${colors.reset}`);
            console.log(`${colors.fg.cyan}║${colors.reset} ${colors.fg.green}• Server running on:${colors.reset} ${colors.fg.yellow}http://localhost:${PORT}${' '.repeat(28)}${colors.fg.cyan}║${colors.reset}`);
            console.log(`${colors.fg.cyan}║${colors.reset} ${colors.fg.green}• Environment:${colors.reset} ${colors.fg.magenta}${process.env.NODE_ENV || 'development'}${colors.reset}${' '.repeat(40)}${colors.fg.cyan}║${colors.reset}`);
            console.log(`${colors.fg.cyan}║${colors.reset} ${colors.fg.green}• API endpoints:${colors.reset} ${colors.fg.blue}http://localhost:${PORT}/api/users${colors.reset}${' '.repeat(21)}${colors.fg.cyan}║${colors.reset}`);
            console.log(`${colors.fg.cyan}╚═════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  });
}).catch(err => {
  console.error(`${colors.bg.red}${colors.fg.white} DATABASE ERROR ${colors.reset} ${colors.fg.red}${err}${colors.reset}`);
  process.exit(1);
});
