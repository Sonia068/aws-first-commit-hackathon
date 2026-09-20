// Turns any error into a consistent JSON response without leaking internals.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message;

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = 'A record with this value already exists';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Not authorized, invalid or expired token';
  }

  if (status >= 500) {
    console.error(err);
    message = 'Something went wrong on the server';
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
