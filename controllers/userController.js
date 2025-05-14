const { User, BlogPost, Follow, Like, Comment } = require('../models');

const getProfile = async (req, res) => {
  try {
    const userId = req.params.id || (req.user ? req.user.id : null);
    if (!userId) {
      return res.redirect('/auth/login');
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          model: BlogPost,
          include: [Like, Comment],
          order: [['createdAt', 'DESC']]
        },
        {
          model: User,
          as: 'Followers',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'Following',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!user) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found'
      });
    }

    const userJson = user.toJSON();
    userJson.BlogPosts = userJson.BlogPosts ? userJson.BlogPosts.map(post => ({
      ...post,
      likeCount: post.Likes ? post.Likes.length : 0,
      commentCount: post.Comments ? post.Comments.length : 0
    })) : [];

    res.render('users/profile', {
      title: `${userJson.username}'s Profile`,
      user: userJson,
      currentUser: req.user || null
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load profile'
    });
  }
};

module.exports = {
  getProfile
};