const express = require('express');
const Movie = require('../models/Movie');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/movies - get all active movies (with optional search/filter)
router.get('/', async (req, res) => {
  try {
    const { search, genre, language } = req.query;
    const query = { isActive: true };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (genre) query.genre = genre;
    if (language) query.language = language;

    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    res.json({ success: true, count: movies.length, movies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, movie });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/movies - admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/movies/:id - admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, movie });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/movies/:id - admin only (soft delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Movie.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Movie removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
