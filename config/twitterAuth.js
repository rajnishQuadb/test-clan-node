import express from 'express';
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const router = express.Router();

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET || !CALLBACK_URL) {
  console.error('Missing Twitter OAuth environment variables');
  throw new Error('Missing Twitter OAuth environment variables');
}

console.log("Callback URL: ", CALLBACK_URL,TWITTER_CONSUMER_KEY , TWITTER_CONSUMER_SECRET, process.env.TWITTER_ACCESS_TOKEN, process.env.TWITTER_ACCESS_TOKEN_SECRET);

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  console.log('Deserializing user:', obj);
  done(null, obj);
});

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
    includeEmail: true,
    passReqToCallback: false,  // Pass req to the callback
    debug: true // Enable debugging for detailed logs
},  (req, token, tokenSecret, profile, done) => {
    console.log("profile---->", profile);
    return done(null, profile); // Make sure you return here
}));

// Start Twitter authentication
router.get('/', (req, res, next) => {
    console.log('Redirecting to Twitter authentication...');
    passport.authenticate('twitter', {
      failureRedirect: '/auth-failed', // Redirect if authentication fails
      failureMessage: true, // This will pass the error message as part of the info object
    })(req, res, next);
  });

// Handle Twitter callback
router.get('/callback', (req, res, next) => {
    // Passport will handle the callback and check the user's authentication
    passport.authenticate('twitter', (err, user, info) => {
      if (err) {
        console.error("Authentication failed during callback:", err);
        return res.status(500).send('Authentication failed');
      }
      if (!user) {
        console.log("Authentication failed - no user:", info);
        return res.status(400).send('Authentication failed');
      }
      console.log("Authentication successful:", user);
      // You can redirect the user to the dashboard or any other page after successful authentication
      return res.send(`
      <h1>Welcome, ${user.username}</h1>
      ${user.photos?.[0]?.value ? `<img src="${user.photos[0].value}" alt="Profile Photo" />` : ''}
      <pre>${JSON.stringify(user, null, 2)}</pre>
    `);
    })(req, res, next);
  });
  
// Failure route
router.get('/auth-failed', (req, res) => {
  console.error('Authentication failed');
  res.send('<h1>Authentication Failed</h1><p>There was an error during the authentication process.</p>');
});

export default router;
