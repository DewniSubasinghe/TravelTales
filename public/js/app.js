// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const flash = require('connect-flash');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Database configuration
const { sequelize, User } = require('./models/db');

// Passport configuration
const initializePassport = require('./config/passport');
initializePassport(passport, User);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, 'db'),
    concurrentDB: true
  }),
  secret: process.env.JWT_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Make user data available to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const blogRouter = require('./routes/blog');
const countriesRouter = require('./routes/countries');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/blog', blogRouter);
app.use('/countries', countriesRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you requested could not be found'
  });
});

// Server initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;