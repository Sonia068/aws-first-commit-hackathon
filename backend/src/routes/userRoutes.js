const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

module.exports = router;
