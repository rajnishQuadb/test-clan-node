import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';


// Route imports
import userRoutes from './routes/users.js';
import campaignRoutes from './routes/campaigns.js';
import leaderboardRoutes from './routes/leaderboards.js'


// ANSI color codes for beautiful terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
  },
  
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m"
  }
};

// Load env vars
dotenv.config();



const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Get color for HTTP method
const getMethodColor = (method) => {
  switch(method) {
    case 'GET': return colors.fg.green;
    case 'POST': return colors.fg.yellow;
    case 'PUT': return colors.fg.blue;
    case 'DELETE': return colors.fg.red;
    case 'PATCH': return colors.fg.cyan;
    default: return colors.fg.white;
  }
};

// Enhanced Request Logging Middleware
// Enhanced Request Logging Middleware
app.use((req, res, next) => {
    const methodColor = getMethodColor(req.method);
    const timestamp = new Date().toISOString();
    
    console.log("\n" + colors.fg.cyan + colors.bright + "╔═════════════════════════════════════════════════════════════════╗" + colors.reset);
    console.log(colors.fg.cyan + "║ " + colors.reset + colors.fg.magenta + timestamp + colors.reset + colors.fg.cyan + "                                       ║" + colors.reset);
    console.log(colors.fg.cyan + "╠═════════════════════════════════════════════════════════════════╣" + colors.reset);
    
    // Method and Route with colored method badge
    console.log(colors.fg.cyan + "║ " + colors.reset + 
                colors.bg[req.method === 'GET' ? 'green' : 
                          req.method === 'POST' ? 'yellow' : 
                          req.method === 'PUT' ? 'blue' : 
                          req.method === 'DELETE' ? 'red' : 
                          req.method === 'PATCH' ? 'cyan' : 'white'] + 
                colors.fg.black + colors.bright + ` ${req.method} ` + colors.reset + 
                " " + colors.bright + colors.fg.white + req.originalUrl + colors.reset + 
                colors.fg.cyan + " ║" + colors.reset);
    
    // Request Body - only show if not empty
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(colors.fg.cyan + "║ " + colors.reset + 
                  colors.fg.yellow + colors.bright + "Request Body: " + colors.reset + 
                  colors.fg.white + JSON.stringify(req.body, null, 2).split('\n').join('\n' + colors.fg.cyan + "║ " + colors.reset + "  ") + 
                  colors.fg.cyan + " ║" + colors.reset);
    }
    
    // Query Parameters - only show if not empty
    if (req.query && Object.keys(req.query).length > 0) {
      console.log(colors.fg.cyan + "║ " + colors.reset + 
                  colors.fg.green + colors.bright + "Query Parameters: " + colors.reset + 
                  colors.fg.white + JSON.stringify(req.query, null, 2).split('\n').join('\n' + colors.fg.cyan + "║ " + colors.reset + "  ") + 
                  colors.fg.cyan + " ║" + colors.reset);
    }
    
    // Headers - show compact version of important headers
    if (req.headers) {
      let headers = { 
        authorization: req.headers.authorization,
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
      };
      
      // Filter out undefined headers
      Object.keys(headers).forEach(key => {
        if (!headers[key]) delete headers[key];
      });
      
      if (Object.keys(headers).length > 0) {
        console.log(colors.fg.cyan + "║ " + colors.reset + 
                    colors.fg.blue + colors.bright + "Important Headers: " + colors.reset + 
                    colors.fg.dim + JSON.stringify(headers, null, 2).split('\n').join('\n' + colors.fg.cyan + "║ " + colors.reset + "  ") +
                    colors.reset + colors.fg.cyan + " ║" + colors.reset);
      }
    }
    
    console.log(colors.fg.cyan + colors.bright + "╚═════════════════════════════════════════════════════════════════╝" + colors.reset);
  
    // Capture the response
   // Update the response capture in your middleware
const originalSend = res.send;
res.send = function(body) {
  const responseTime = new Date() - req._startTime;
  
  console.log("\n" + colors.fg.cyan + colors.bright + "╔═════════════════════════════════════════════════════════════════╗" + colors.reset);
  console.log(colors.fg.cyan + "║ " + colors.reset + 
              colors.fg.green + colors.bright + "Response: " + colors.reset + 
              colors.fg.white + `Status ${res.statusCode} - ${responseTime}ms` + colors.reset +
              colors.fg.cyan + "                         ║" + colors.reset);
  
  // Display response body if it's a string or can be stringified
  if (body) {
    let responseBody = body;
    
    // If it's not a string already, try to stringify it
    if (typeof body !== 'string') {
      try {
        responseBody = JSON.stringify(body, null, 2);
      } catch (e) {
        responseBody = "[Complex body - cannot display]";
      }
    }
    
    // Limit length to prevent flooding the console
    if (responseBody.length > 1000) {
      responseBody = responseBody.substring(0, 1000) + "... [truncated]";
    }
    
    console.log(colors.fg.cyan + "║ " + colors.reset + 
                colors.fg.blue + colors.bright + "Response Body: " + colors.reset + 
                colors.fg.white + responseBody.split('\n').join('\n' + colors.fg.cyan + "║ " + colors.reset + "  ") + 
                colors.fg.cyan + " ║" + colors.reset);
  }
  
  console.log(colors.fg.cyan + colors.bright + "╚═════════════════════════════════════════════════════════════════╝" + colors.reset);
  
  originalSend.apply(res, arguments);
};
    
    req._startTime = new Date();
    next();
  });

// Development logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}



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
  console.error(`\n ${colors.bg.red}${colors.fg.white} ERROR ${colors.reset} ${colors.fg.red}${err.stack}${colors.reset}`);
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
            console.log(`\n${colors.fg.cyan}${colors.bright}╔═════════════════════════════════════════════════════════════════╗${colors.reset}`);
            console.log(`${colors.fg.cyan}║${colors.reset} ${colors.bright}${colors.fg.white}             KILT Social Auth Backend Server                ${colors.reset}${colors.fg.cyan} ║${colors.reset}`);
            console.log(`${colors.fg.cyan}╠═════════════════════════════════════════════════════════════════╣${colors.reset}`);
            console.log(`${colors.fg.cyan}║${colors.reset} ${colors.fg.green}• Server running on:${colors.reset} ${colors.fg.yellow}http://localhost:${PORT}${colors.reset}${' '.repeat(28)}${colors.fg.cyan}║${colors.reset}`);
            console.log(`${colors.fg.cyan}║${colors.reset} ${colors.fg.green}• Environment:${colors.reset} ${colors.fg.magenta}${process.env.NODE_ENV || 'development'}${colors.reset}${' '.repeat(40)}${colors.fg.cyan}║${colors.reset}`);
            console.log(`${colors.fg.cyan}║${colors.reset} ${colors.fg.green}• API endpoints:${colors.reset} ${colors.fg.blue}http://localhost:${PORT}/api/users${colors.reset}${' '.repeat(21)}${colors.fg.cyan}║${colors.reset}`);
            console.log(`${colors.fg.cyan}╚═════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
          });
    })
    .catch((error) => {
        console.error(`\n${colors.bg.red}${colors.fg.white} DATABASE ERROR ${colors.reset} ${colors.fg.red}${error}${colors.reset}\n`);
        process.exit(1);
});

export default app;