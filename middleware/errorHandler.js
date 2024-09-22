const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Determine the status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  
    // Create error response
    const errorResponse = {
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    };
  
    // If it's a Mongoose error, add more details
    if (err.name === 'ValidationError') {
      errorResponse.errors = Object.values(err.errors).map(error => error.message);
    }
  
    res.json(errorResponse);
  };
  
  module.exports = errorHandler;