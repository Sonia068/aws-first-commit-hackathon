const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  // An invalid or expired token throws and is handled by errorMiddleware.
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(id);
  if (!user) return res.status(401).json({ success: false, message: 'Not authorized, user not found' });

  req.user = user;
  next();
};

module.exports = { protect };
