const Hackathon = require('../models/Hackathon');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sorts = {
  deadline: { registrationDeadline: 1 },
  newest: { startDate: -1 },
};

const getHackathons = async ({ search, domain, mode, skill, sort } = {}) => {
  const filter = {};
  if (search) {
    const regex = new RegExp(escapeRegex(String(search)), 'i');
    filter.$or = [{ title: regex }, { organizer: regex }];
  }
  if (domain) filter.domain = String(domain);
  if (mode) filter.mode = String(mode);
  if (skill) filter.skills = String(skill);

  return Hackathon.find(filter).sort(sorts[sort] || { createdAt: -1 });
};

const getHackathonById = async (id) => {
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) throw Object.assign(new Error('Hackathon not found'), { statusCode: 404 });
  return hackathon;
};

const createHackathon = async (data = {}, userId) => {
  const {
    title, description, organizer, domain, location, mode, startDate, endDate,
    registrationDeadline, registrationLink, image, skills, prize, participantCount,
  } = data;

  return Hackathon.create({
    title, description, organizer, domain, location, mode, startDate, endDate,
    registrationDeadline, registrationLink, image, skills, prize, participantCount,
    createdBy: userId,
  });
};

module.exports = { getHackathons, getHackathonById, createHackathon };
