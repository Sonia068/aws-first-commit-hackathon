const router = require('express').Router();
const { getHackathons, getHackathon, createHackathon } = require('../controllers/hackathonController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getHackathons);
router.get('/:id', getHackathon);
router.post('/', protect, createHackathon);

module.exports = router;
