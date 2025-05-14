const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Set default error message
  const message = err.message || 'Something went wrong';
  const status = err.status || 500;

  // If the request expects JSON, return JSON
  if (req.accepts('json')) {
    return res.status(status).json({ error: message });
  }

  // Otherwise render error page
  res.status(status).render('error', {
    title: 'Error',
    message: message,
    status: status
  });
};

module.exports = { errorHandler };