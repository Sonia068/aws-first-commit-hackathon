const hackathonService = require('../services/hackathonService');

const getHackathons = async (req, res) => {
  const data = await hackathonService.getHackathons(req.query);
  res.json({ success: true, message: 'Request successful', data });
};

const getHackathon = async (req, res) => {
  const data = await hackathonService.getHackathonById(req.params.id);
  res.json({ success: true, message: 'Request successful', data });
};

const createHackathon = async (req, res) => {
  const data = await hackathonService.createHackathon(req.body, req.user.id);
  res.status(201).json({ success: true, message: 'Hackathon created', data });
};

module.exports = { getHackathons, getHackathon, createHackathon };
