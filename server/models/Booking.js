const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    seats: [{ type: String }],       // e.g. ["A1", "A2"]
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String, default: '' },
    bookingId: { type: String, unique: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Auto-generate a booking ID before save
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = 'BMS' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
