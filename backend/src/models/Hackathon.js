const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    organizer: { type: String, required: true, trim: true },
    domain: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: 'Remote' },
    mode: { type: String, enum: ['Online', 'In-Person', 'Hybrid'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    registrationLink: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    skills: { type: [String], default: [] },
    prize: { type: String, default: '' },
    participantCount: { type: Number, min: 0, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
      },
    },
  }
);

module.exports = mongoose.model('Hackathon', hackathonSchema);
