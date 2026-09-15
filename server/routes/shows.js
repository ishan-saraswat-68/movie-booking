const express = require('express');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const { protect, adminOnly } = require('../middleware/auth');
const { redisClient, releaseLock } = require('../utils/redisClient');

const router = express.Router();

// GET /api/shows?movie=&date=&city=
router.get('/', async (req, res) => {
  try {
    const { movie, date, theatreId } = req.query;
    const query = { isActive: true };
    if (movie) query.movie = movie;
    if (theatreId) query.theatre = theatreId;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const shows = await Show.find(query)
      .populate('movie', 'title poster duration genre')
      .populate('theatre', 'name address city')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, shows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/shows/:id
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    // Fetch active per-seat locks from Redis
    const prefix = `lock:show:${show._id}:seat:`;
    const lockKeys = await redisClient.keys(`${prefix}*`);
    const lockedSeats = (lockKeys || []).map((key) => key.slice(prefix.length));

    // Merge lockedSeats into the response
    const showData = show.toObject();
    showData.lockedSeats = lockedSeats;

    res.json({ success: true, show: showData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shows/:id/lock
router.post('/:id/lock', protect, async (req, res) => {
  try {
    const { seatId } = req.body;
    const showId = req.params.id;
    const userId = req.user._id.toString();

    if (!seatId) {
      return res.status(400).json({ success: false, message: 'seatId is required' });
    }

    // 1. Check if already booked in MongoDB
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    if (show.bookedSeats.includes(seatId)) {
      return res.status(400).json({ success: false, message: 'Seat already booked' });
    }

    // 2. ATOMIC LOCK ACQUISITION in Redis (NX: only set if Not eXists, EX: 300s TTL)
    const lockKey = `lock:show:${showId}:seat:${seatId}`;
    const acquired = await redisClient.set(lockKey, userId, { NX: true, EX: 300 });

    if (!acquired) {
      // Check if current user is the one who already holds this lock
      const currentHolder = await redisClient.get(lockKey);
      if (currentHolder !== userId) {
        return res.status(400).json({ success: false, message: 'Seat is currently locked by another user' });
      }
    }

    // 3. Emit real-time lock event to room
    req.io.to(showId).emit('seat-locked', { seatId, userId });

    res.json({ success: true, message: 'Seat locked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shows/:id/unlock
router.post('/:id/unlock', protect, async (req, res) => {
  try {
    const { seatId } = req.body;
    const showId = req.params.id;
    const userId = req.user._id.toString();
    const lockKey = `lock:show:${showId}:seat:${seatId}`;

    if (!seatId) {
      return res.status(400).json({ success: false, message: 'seatId is required' });
    }

    // Safe unlock: atomically delete only if value equals userId
    const released = await releaseLock(lockKey, userId);

    if (released) {
      req.io.to(showId).emit('seat-unlocked', { seatId });
    }

    res.json({ success: true, message: 'Seat unlocked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/shows - admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const show = await Show.create(req.body);
    res.status(201).json({ success: true, show });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/shows/:id - admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    res.json({ success: true, show });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/shows/:id - admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Show.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Show removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
