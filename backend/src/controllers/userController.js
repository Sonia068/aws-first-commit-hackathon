const authService = require('../services/authService');

const getProfile = async (req, res) => {
  res.json({ success: true, message: 'Request successful', data: authService.toUserData(req.user) });
};

const updateProfile = async (req, res) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, message: 'Profile updated', data });
};

module.exports = { getProfile, updateProfile };
