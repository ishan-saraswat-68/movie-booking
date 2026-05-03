const express = require('express');
const Theatre = require('../models/Theatre');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/theatres
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const query = { isActive: true };
    if (city) query.city = { $regex: city, $options: 'i' };
    const theatres = await Theatre.find(query);
    res.json({ success: true, theatres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/theatres/:id
router.get('/:id', async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, theatre });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/theatres - admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ success: true, theatre });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/theatres/:id - admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, theatre });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/theatres/:id - admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Theatre.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Theatre removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
