const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { protect, adminOnly } = require('../middleware/auth');
const { redisClient, releaseLock } = require('../utils/redisClient');

const router = express.Router();

// POST /api/bookings - create a booking
router.post('/', protect, async (req, res) => {
  try {
    const { showId, seats, totalAmount } = req.body;
    const userId = req.user._id.toString();

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid show or seat selection' });
    }

    // 1. VERIFY REDIS LOCK OWNERSHIP FOR ALL REQUESTED SEATS
    for (const seatId of seats) {
      const lockKey = `lock:show:${showId}:seat:${seatId}`;
      const lockOwner = await redisClient.get(lockKey);
      
      // Also check fallback legacy hash key for backwards compatibility
      const legacyOwner = !lockOwner ? await redisClient.hGet(`seat_lock:${showId}`, seatId) : null;
      const effectiveOwner = lockOwner || legacyOwner;

      if (effectiveOwner !== userId) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatId} lock has expired or is not reserved by you. Please select seats again.`,
        });
      }
    }

    // 2. ATOMIC MONGODB CONDITIONAL UPDATE ($nin ensures NONE of the seats are already booked)
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        bookedSeats: { $nin: seats },
      },
      {
        $push: { bookedSeats: { $each: seats } },
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected seats have already been booked by another user.',
      });
    }

    // 3. CREATE BOOKING RECORD
    const booking = await Booking.create({
      user: req.user._id,
      show: showId,
      seats,
      totalAmount,
      paymentStatus: 'completed', // Simulate payment success
    });

    // 4. ATOMIC / SAFE UNLOCK: Release Redis locks and emit seat-booked event
    for (const seatId of seats) {
      const lockKey = `lock:show:${showId}:seat:${seatId}`;
      await releaseLock(lockKey, userId);
      await redisClient.hDel(`seat_lock:${showId}`, seatId);
      req.io.to(showId).emit('seat-booked', { seatId });
    }

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

    // Atomically release seats from show
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { $in: booking.seats } }
    });

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
