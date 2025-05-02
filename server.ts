import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Database and models
import sequelize from './config/db';
import './models/User'; // Import to initialize models
// Import at the top of your server.ts or index.ts file
import './models/associations';
import setupAssociations from './models/associations';
// Route imports
import userRoutes from './routes/usersRoutes';
import googleAuthRoutes from './routes/googleAuthRoutes';
import appleAuthRoutes from './routes/appleAuthRoutes';
import { AppError } from './utils/error-handler';
import { HTTP_STATUS } from './constants/http-status';
import passport from 'passport';
import session from 'express-session';
import twitterAuthRoutes from './routes/twitterAuthRoutes';
import path from 'path';
import campaignRoutes from './routes/campaignRoutes';
import './models/types';
import './models/User';
import './models/Campaign';
import './models/CampaignLeaderBoard';
import './models/CampaignLeaderBoardUser';
import './models/CampaignParticipant';
import {createUserLimiter} from './middleware/rateLimiter';
setupAssociations(); // Call the function to set up all associations


// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Basic request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Configure session and passport
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'twitter-auth-secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: process.env.NODE_ENV === 'production' }
// }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

// app.use(passport.initialize());
// app.use(passport.session());

// Register Twitter auth routes
app.use('/api/auth', twitterAuthRoutes);

// Serve static HTML pages
app.get('/privacyPolicy', (req, res) => {
  res.sendFile(path.join(__dirname, 'htmlPages/privacyPolicy.html'));
});

app.get('/termsOfService', (req, res) => {
  res.sendFile(path.join(__dirname, 'htmlPages/termsOfService.html'));
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('CLANS-NODE-APP is running');
});
app.get('/api', createUserLimiter, (req: Request, res: Response) => {
  res.send('CLANS-NODE-APP API is running');
});

// Mount routes
app.use('/api/user', userRoutes);
// Register Google auth routes
app.use('/api/auth', googleAuthRoutes);
// Register Apple auth routes
app.use('/api/auth', appleAuthRoutes);

app.use('/api/campaign', campaignRoutes);

// Not found middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, HTTP_STATUS.NOT_FOUND));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  
  console.error(`Error: ${err.message}`);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 8000;

// Sync database models
sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
    process.exit(1);
  });

export default app;