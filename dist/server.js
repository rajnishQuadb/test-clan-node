"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Database and models
const db_1 = __importDefault(require("./config/db"));
require("./models/User"); // Import to initialize models
// Import at the top of your server.ts or index.ts file
require("./models/associations");
const associations_1 = __importDefault(require("./models/associations"));
// Route imports
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const googleAuthRoutes_1 = __importDefault(require("./routes/googleAuthRoutes"));
const appleAuthRoutes_1 = __importDefault(require("./routes/appleAuthRoutes"));
const error_handler_1 = require("./utils/error-handler");
const http_status_1 = require("./constants/http-status");
const express_session_1 = __importDefault(require("express-session"));
const twitterAuthRoutes_1 = __importDefault(require("./routes/twitterAuthRoutes"));
const path_1 = __importDefault(require("path"));
const campaignRoutes_1 = __importDefault(require("./routes/campaignRoutes"));
require("./models/types");
require("./models/User");
require("./models/Campaign");
require("./models/CampaignLeaderBoard");
require("./models/CampaignLeaderBoardUser");
require("./models/CampaignParticipant");
const rateLimiter_1 = require("./middleware/rateLimiter");
(0, associations_1.default)(); // Call the function to set up all associations
const clansRoutes_1 = __importDefault(require("./routes/clansRoutes"));
const referralRoutes_1 = __importDefault(require("./routes/referralRoutes"));
// Load env vars
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://clans.10on10studios.com'
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
}));
// Basic request logging middleware
app.use((req, res, next) => {
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
app.use((0, express_session_1.default)({
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
// Serve static HTML pages
app.get('/privacyPolicy', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'htmlPages/privacyPolicy.html'));
});
app.get('/termsOfService', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'htmlPages/termsOfService.html'));
});
// Root route
app.get('/', (req, res) => {
    res.send('CLANS-NODE-APP is running');
});
app.get('/api', rateLimiter_1.createUserLimiter, (req, res) => {
    res.send('CLANS-NODE-APP API is running');
});
app.get('/api/v1/dev', (req, res) => {
    res.send('CLANS-NODE-APP API v1 is running');
});
// Route so reset the DB and start fresh (Only for development purposes)
app.get('/api/v1/reset', async (req, res) => {
    try {
        await db_1.default.sync({ force: true });
        res.status(200).json({ message: 'Database reset successfully' });
    }
    catch (error) {
        console.error('Error resetting database:', error);
        res.status(500).json({ message: 'Error resetting database' });
    }
});
// Mount routes
app.use('/api/user', usersRoutes_1.default);
// Register Google auth routes
app.use('/api/auth', googleAuthRoutes_1.default);
// Register Apple auth routes
app.use('/api/auth', appleAuthRoutes_1.default);
app.use('/api/campaign', campaignRoutes_1.default);
// Register Twitter auth routes
app.use('/api/auth', twitterAuthRoutes_1.default);
// Register clans routes
app.use('/api/clans', clansRoutes_1.default);
// Register Twitter post routes
// app.use('/api/twitter', twitterPostRoutes);
// Register Referral routes
app.use('/api/referral', referralRoutes_1.default);
// Not found middleware
app.use((req, res, next) => {
    next(new error_handler_1.AppError(`Cannot find ${req.originalUrl} on this server`, http_status_1.HTTP_STATUS.NOT_FOUND));
});
// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    console.error(`Error: ${err.message}`);
    res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
const PORT = process.env.PORT || 8000;
// Sync database models
db_1.default.sync({ alter: process.env.NODE_ENV === 'development' })
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
exports.default = app;
//# sourceMappingURL=server.js.map