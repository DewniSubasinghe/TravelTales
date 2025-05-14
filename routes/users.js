const express = require('express');
const router = express.Router();
const { User, BlogPost, Like, Comment, Follow } = require('../models');
const { ensureAuthenticated } = require('../middleware/auth');

// Profile route
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
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
      dislikeCount: post.Likes ? post.Likes.filter(l => l.type === 'dislike').length : 0,
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
});

// Feed route
router.get('/:id/feed', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verify the user is viewing their own feed
    if (req.user.id.toString() !== userId.toString()) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You can only view your own feed'
      });
    }

    const user = await User.findByPk(userId, {
      include: [{
        model: User,
        as: 'Following',
        attributes: ['id']
      }]
    });

    if (!user) {
      return res.status(404).render('error', {
        title: 'Not Found',
        message: 'User not found'
      });
    }

    // Get posts from users being followed
    const followingIds = user.Following.map(f => f.id);
    const posts = await BlogPost.findAll({
      where: { userId: followingIds },
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
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
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const postsWithCounts = posts.map(post => {
      const postJson = post.toJSON();
      return {
        ...postJson,
        User: postJson.User || { id: 0, username: 'Unknown' },
        likeCount: postJson.Likes ? postJson.Likes.length : 0,
        commentCount: postJson.Comments ? postJson.Comments.length : 0
      };
    });

    res.render('users/feed', {
      title: 'Your Feed',
      posts: postsWithCounts,
      user: req.user
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load feed'
    });
  }
});

// Follow/unfollow route
router.post('/:id/follow', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.id.toString() === userId.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    const [follow, created] = await Follow.findOrCreate({
      where: {
        followerId: req.user.id,
        followingId: userId
      }
    });

    if (!created) {
      await follow.destroy();
    }

    res.json({
      success: true,
      followed: created
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update follow status'
    });
  }
});

module.exports = router;