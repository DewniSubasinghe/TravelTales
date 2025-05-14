// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please login to view this page');
  res.redirect('/auth/login');
}

function ensureGuest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = {
  ensureAuthenticated,
  ensureGuest
};