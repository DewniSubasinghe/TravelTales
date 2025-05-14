const express = require('express');
const router = express.Router();
const { BlogPost, User, Like, Comment } = require('../models');
const { getCountryData } = require('../utils/helpers');

router.get('/:name', async (req, res) => {
  try {
    const countryName = decodeURIComponent(req.params.name);
    
    // Get country data
    const countryData = await getCountryData(countryName) || {
      name: countryName,
      flag: '',
      capital: 'Unknown',
      currencies: ['Unknown'],
      languages: ['Unknown'],
      region: 'Unknown',
      subregion: 'Unknown'
    };

    // Get posts for this country with counts
    const posts = await BlogPost.findAll({
      where: { countryName },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'profilePicture'],
          required: false
        },
        {
          model: Like,
          attributes: ['id']
        },
        {
          model: Comment,
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const postsWithCounts = posts.map(post => ({
      ...post.toJSON(),
      likeCount: post.Likes ? post.Likes.length : 0,
      commentCount: post.Comments ? post.Comments.length : 0,
      User: post.User || { id: 0, username: 'Unknown' }
    }));

    res.render('countries/show', {
      title: `Posts about ${countryName}`,
      countryName,
      countryData,
      posts: postsWithCounts,
      user: req.user
    });
  } catch (error) {
    console.error('Error getting country posts:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load country information'
    });
  }
});

module.exports = router;