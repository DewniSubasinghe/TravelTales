const { BlogPost, User, Like, Comment } = require('../models');
const axios = require('axios');

const getHomePage = async (req, res) => {
  try {
    // Get recent posts with user and like/comment counts
    const recentPosts = await BlogPost.findAll({
      limit: 10,
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
          required: false
        },
        {
          model: Like,
          attributes: ['id', 'type']
        },
        {
          model: Comment,
          attributes: ['id']
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
          attributes: ['id', 'type']
        },
        {
          model: Comment,
          attributes: ['id']
        }
      ],
      order: [[Like, 'id', 'DESC']]
    });

    // Add counts to posts
    const postsWithCounts = recentPosts.map(post => {
      const postJson = post.toJSON();
      const likes = postJson.Likes ? postJson.Likes.filter(l => l.type === 'like').length : 0;
      const dislikes = postJson.Likes ? postJson.Likes.filter(l => l.type === 'dislike').length : 0;
      return {
        ...postJson,
        likeCount: likes,
        dislikeCount: dislikes,
        commentCount: postJson.Comments ? postJson.Comments.length : 0,
        User: postJson.User || { id: 0, username: 'Unknown' }
      };
    });

    const popularWithCounts = popularPosts.map(post => {
      const postJson = post.toJSON();
      const likes = postJson.Likes ? postJson.Likes.filter(l => l.type === 'like').length : 0;
      const dislikes = postJson.Likes ? postJson.Likes.filter(l => l.type === 'dislike').length : 0;
      return {
        ...postJson,
        likeCount: likes,
        dislikeCount: dislikes,
        commentCount: postJson.Comments ? postJson.Comments.length : 0,
        User: postJson.User || { id: 0, username: 'Unknown' }
      };
    });

    // Get all countries for dropdown
    let countries = [];
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all');
      countries = response.data.map(c => c.name.common).sort();
    } catch (error) {
      console.error('Error fetching countries:', error);
      countries = [];
    }

    res.render('home', {
      title: 'TravelTales - Home',
      recentPosts: postsWithCounts,
      popularPosts: popularWithCounts,
      countries,
      user: req.user,
      isAuthenticated: req.isAuthenticated()
    });
  } catch (error) {
    console.error('Error in home controller:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Error loading home page'
    });
  }
};

module.exports = { getHomePage };