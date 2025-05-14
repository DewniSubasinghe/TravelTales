const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureGuest } = require('../middleware/auth');
const { User } = require('../models');

// Login Page
router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    messages: req.flash('error')
  });
});

// Login Handler
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// Register Page
router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    messages: req.flash('error')
  });
});

// Register Handler
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/auth/register');
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      req.flash('error', 'Email already exists');
      return res.redirect('/auth/register');
    }

    const user = await User.create({ username, email, password });
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.redirect('/auth/login');
      }
      return res.redirect('/');
    });
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});

module.exports = router;