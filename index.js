import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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


// Load env vars
dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());


// Basic request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  
  // Track request start time for response time logging
  req._startTime = new Date();
  
  // Capture and log response
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = new Date() - req._startTime;
    console.log(`${new Date().toISOString()} - Response: Status ${res.statusCode} - ${responseTime}ms`);
    originalSend.apply(res, arguments);
  };
  
  next();
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

// Connect to database
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error(`Database connection error: ${error}`);
    process.exit(1);
  });

export default app;
