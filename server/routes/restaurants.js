const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM restaurants');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/restaurants
router.post('/', async (req, res) => {
  try {
    const { name, location, cuisine, price_range, image_url } = req.body;

    if (!name || !location || !cuisine || !price_range) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const [result] = await db.query(
      'INSERT INTO restaurants (name, location, cuisine, price_range, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, location, cuisine, price_range, image_url || null]
    );

    res.status(201).json({ message: ' Restaurant added successfully.', id: result.insertId });
  } catch (error) {
    console.error(' Error inserting restaurant:', error.message);
    res.status(500).json({ error: 'Failed to add restaurant.' });
  }
});

module.exports = router;
