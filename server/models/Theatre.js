const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, default: '' },
    totalSeats: { type: Number, required: true },
    seatLayout: {
      rows: { type: Number, required: true },
      cols: { type: Number, required: true },
      categories: [
        {
          name: { type: String }, // e.g. "Recliner", "Gold", "Silver"
          rows: [String],         // e.g. ["A","B"]
          price: Number,
        },
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theatre', theatreSchema);
