import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports
import userRoutes from './routes/users.js';
import campaignRoutes from './routes/campaigns.js';
import leaderboardRoutes from './routes/leaderboards.js';

// Load env vars
dotenv.config();

const app = express();

// Middleware
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

// Root route
app.get('/', (req, res) => {
  res.send('KILT Social Auth API is running...');
});

// API route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running...',
  });
});

// Health check route
app.get('/api/health-check', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
  });
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/leaderboards', leaderboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.stack}`);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

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