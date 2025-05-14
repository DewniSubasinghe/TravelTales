const express = require('express');
const router = express.Router();
const { BlogPost, User, Like } = require('../models');
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    // Get recent posts
    const recentPosts = await BlogPost.findAll({
      limit: 10,
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get popular posts (most liked)
    const popularPosts = await BlogPost.findAll({
      limit: 5,
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          required: false
        },
        {
          model: Like,
          attributes: ['id']
        }
      ],
      order: [[Like, 'id', 'DESC']]
    });

    // Get all countries
    const countriesResponse = await axios.get('https://restcountries.com/v3.1/all');
    const countries = countriesResponse.data.map(c => c.name.common).sort();

    res.render('home', {
      title: 'TravelTales - Home',
      recentPosts,
      popularPosts,
      countries,
      user: req.user,
      isAuthenticated: req.isAuthenticated()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load home page'
    });
  }
});

module.exports = router;