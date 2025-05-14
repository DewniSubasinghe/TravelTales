require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const flash = require('connect-flash');
const { errorHandler } = require('./middleware/errorHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware with CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://flagcdn.com",
          "https://upload.wikimedia.org",
          "https://*.amazonaws.com"
        ],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        connectSrc: ["'self'", "https://restcountries.com"]
      }
    }
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 500, // limiting each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  skip: (req) => {
    // Skip rate limiting for certain routes
    if (req.path.startsWith('/public') || req.path === '/') {
      return true;
    }
    return false;
  }
});

app.use(limiter);

// Database configuration
const { sequelize, User } = require('./models');

// Passport configuration
require('./config/passport')(passport, User);

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
    maxAge: 7 * 24 * 60 * 60 * 1000
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

// Add this after your other middleware but before routes
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// Database sync and server start
const startServer = async () => {
  try {
    // First try with alter: false
    await sequelize.sync({ alter: false });
    console.log('Database synced successfully');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (initialError) {
    console.error('Initial sync failed, trying force sync:', initialError);
    
    try {
      // If that fails, try with force: true (will drop all tables)
      await sequelize.sync({ force: true });
      console.log('Database force synced successfully');
      
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (forceError) {
      console.error('Force sync failed:', forceError);
      process.exit(1);
    }
  }
};

startServer();

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const blogRouter = require('./routes/blog');
const countriesRouter = require('./routes/countries');
const searchRouter = require('./routes/search');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/blog', blogRouter);
app.use('/countries', countriesRouter);
app.use('/search', searchRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you requested could not be found'
  });
});

// Database sync and server start
sequelize.sync({ alter: { drop: false } }) // Prevents dropping columns
  .then(() => {
    console.log('Database synced safely');
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database sync error:', err);
  });

module.exports = app;