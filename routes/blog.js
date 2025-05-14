const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const blogController = require('../controllers/blogController');
const { validateBlogPost, validateComment } = require('../utils/validators');

// GET all blog posts
router.get('/', blogController.getPosts);
// GET form to create new blog post
router.get('/create', ensureAuthenticated, blogController.getCreateForm);
// POST create new blog post
router.post('/', ensureAuthenticated, validateBlogPost, blogController.createPost);
// GET single blog post
router.get('/:id', blogController.getPost);
// GET form to edit blog post
router.get('/:id/edit', ensureAuthenticated, blogController.getEditForm);
// PUT update blog post
router.post('/:id/update', ensureAuthenticated, validateBlogPost, blogController.updatePost);
// DELETE blog post
router.post('/:id/delete', ensureAuthenticated, blogController.deletePost);
// POST like post
router.post('/:id/like', ensureAuthenticated, blogController.likePost);
// POST dislike post
router.post('/:id/dislike', ensureAuthenticated, blogController.dislikePost);
// POST comment on post
router.post('/:id/comment', ensureAuthenticated, validateComment, blogController.commentOnPost);

module.exports = router;