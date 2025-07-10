// server/routes/uploads.js

const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../../config/cloudinary');

const router = express.Router();

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'restaurant_images',             
    allowed_formats: ['jpg', 'jpeg', 'png'],   
  },
});

const upload = multer({ storage });

//  POST /api/upload-image
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  res.status(200).json({
    url: req.file.path,            
    public_id: req.file.filename,  
  });
});

module.exports = router;
