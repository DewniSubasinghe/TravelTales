const { check } = require('express-validator');

exports.validateBlogPost = [
  check('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
 
  check('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
 
  check('countryName')
    .notEmpty().withMessage('Country is required'),
 
  check('visitDate')
    .notEmpty().withMessage('Visit date is required')
    .isDate().withMessage('Invalid date format')
];

exports.validateComment = [
  check('content')
    .notEmpty().withMessage('Comment cannot be empty')
    .isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
];

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};