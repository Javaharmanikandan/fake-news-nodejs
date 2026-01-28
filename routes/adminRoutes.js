// ====================================================
// ADMIN ROUTES
// ====================================================

const express = require('express');
const router = express.Router();
const { 
    getReportedNews, 
    addFakeNews, 
    getFakeNewsDatabase, 
    deleteNews 
} = require('../controllers/adminController');

// Get all reported news
router.get('/reports', getReportedNews);

// Add verified fake news
router.post('/fake-news', addFakeNews);

// Get fake news database
router.get('/fake-news', getFakeNewsDatabase);

// Delete news item
router.delete('/news/:id', deleteNews);

module.exports = router;

