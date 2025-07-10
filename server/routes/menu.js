const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary');
const db = require('../../config/db');

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'menu_items',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// POST /api/menu-items
router.post('/', upload.single('image'), async (req, res) => {
  const { restaurant_id, name, description, price } = req.body;

  if (!restaurant_id || !name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const imageUrl = req.file?.path || null;

    await db.query(
      'INSERT INTO menu_items (restaurant_id, name, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [restaurant_id, name, description, price, imageUrl]
    );

    res.json({ message: 'Menu item added successfully' });
  } catch (err) {
    console.error('Error adding menu item:', err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

module.exports = router;
