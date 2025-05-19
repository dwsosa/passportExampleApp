require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cors = require('cors');


const initDb = require('./initDb');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: 'http://localhost:3000', // React frontend URL
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());

// Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return done(null, false);

    const match = await bcrypt.compare(password, user.password);
    return match ? done(null, user) : done(null, false);
  } catch (err) {
    return done(err);
  }
}));

// JWT Strategy
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [jwt_payload.username]);
    const user = result.rows[0];
    return user ? done(null, user) : done(null, false);
  } catch (err) {
    return done(err);
  }
}));

// Register Route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashed]);
    res.json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login Route - returns JWT
app.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ message: 'Authentication failed' });

    const payload = { username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  })(req, res, next);
});

// Protected Route
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: `Hello ${req.user.username}, you have access.` });
});

// Start App
initDb().then(() => {
  app.listen(5000, () =>{ 
    console.log('Server running on http://localhost:5000')
    console.log('🌍 Current NODE_ENV:', process.env.NODE_ENV);
  });
});
// This code sets up an Express server with user registration and authentication using Passport.js.
// It uses JWT for token-based authentication and bcrypt for password hashing.