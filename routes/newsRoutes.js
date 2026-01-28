// ====================================================
// NEWS ROUTES
// ====================================================

const express = require('express');
const router = express.Router();
const { submitNews, getNewsHistory, getNewsById } = require('../controllers/newsController');

// Submit news for detection
router.post('/submit', submitNews);

// Get user's news history
router.get('/history/:userId', getNewsHistory);

// Get single news item
router.get('/:id', getNewsById);

module.exports = router;

