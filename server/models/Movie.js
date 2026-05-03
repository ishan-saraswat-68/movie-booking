const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: [{ type: String }],
    language: [{ type: String, default: ['Hindi', 'English'] }],
    duration: { type: Number, required: true }, // in minutes
    releaseDate: { type: Date, required: true },
    poster: { type: String, required: true },
    trailer: { type: String, default: '' },
    cast: [{ name: String, role: String, image: String }],
    director: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
