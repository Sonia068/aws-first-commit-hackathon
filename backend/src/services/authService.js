const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const fail = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const toUserData = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  profileImage: user.profileImage,
  skills: user.skills,
  role: user.role,
});

const register = async ({ name, email, password } = {}) => {
  if (!name || !email || !password) throw fail(400, 'Name, email and password are required');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw fail(400, 'Please provide a valid email');
  if (String(password).length < 6) throw fail(400, 'Password must be at least 6 characters');

  if (await User.findOne({ email: String(email).toLowerCase().trim() })) {
    throw fail(409, 'An account with this email already exists');
  }

  const hashed = await bcrypt.hash(String(password), 10);
  const user = await User.create({ name, email, password: hashed });
  return { token: generateToken(user.id), user: toUserData(user) };
};

const login = async ({ email, password } = {}) => {
  if (!email || !password) throw fail(400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await bcrypt.compare(String(password), user.password))) {
    throw fail(401, 'Invalid email or password');
  }
  return { token: generateToken(user.id), user: toUserData(user) };
};

const updateProfile = async (userId, { name, profileImage, skills } = {}) => {
  if (skills !== undefined && !Array.isArray(skills)) throw fail(400, 'Skills must be an array');

  const updates = Object.fromEntries(
    Object.entries({ name, profileImage, skills }).filter(([, value]) => value !== undefined)
  );
  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
  return toUserData(user);
};

module.exports = { register, login, updateProfile, toUserData };
