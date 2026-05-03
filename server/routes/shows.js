const express = require('express');
const Show = require('../models/Show');
const { protect, adminOnly } = require('../middleware/auth');

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
    res.json({ success: true, show });
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
