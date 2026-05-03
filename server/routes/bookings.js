const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings - create a booking
router.post('/', protect, async (req, res) => {
  try {
    const { showId, seats, totalAmount } = req.body;

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // Check if any seat is already booked
    const alreadyBooked = seats.filter((s) => show.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${alreadyBooked.join(', ')} are already booked`,
      });
    }

    // Mark seats as booked
    show.bookedSeats.push(...seats);
    await show.save();

    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      seats,
      totalAmount,
      paymentStatus: 'completed', // Simulate payment success
    });

    await booking.populate([
      { path: 'show', populate: [{ path: 'movie', select: 'title poster' }, { path: 'theatre', select: 'name city' }] },
    ]);

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/my - get current user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title poster genre duration' },
          { path: 'theatre', select: 'name address city' },
        ],
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'show',
      populate: [{ path: 'movie' }, { path: 'theatre' }],
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only allow user who booked or admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // Release seats
    const show = await Show.findById(booking.show);
    show.bookedSeats = show.bookedSeats.filter((s) => !booking.seats.includes(s));
    await show.save();

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings - admin only, get all bookings
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({ path: 'show', populate: [{ path: 'movie', select: 'title' }, { path: 'theatre', select: 'name city' }] })
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
