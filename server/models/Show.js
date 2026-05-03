const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "10:30 AM"
    language: { type: String, required: true },
    format: { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
    totalSeats: { type: Number, required: true },
    bookedSeats: [{ type: String }], // e.g. ["A1", "A2"]
    price: {
      recliner: { type: Number, default: 500 },
      gold: { type: Number, default: 300 },
      silver: { type: Number, default: 180 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Show', showSchema);
