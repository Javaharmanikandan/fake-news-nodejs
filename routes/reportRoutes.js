// ====================================================
// REPORT ROUTES
// ====================================================

const express = require('express');
const router = express.Router();
const { submitReport, getReportsByNewsId } = require('../controllers/reportController');

// Submit a report/vote
router.post('/submit', submitReport);

// Get reports for a news item
router.get('/news/:newsId', getReportsByNewsId);

module.exports = router;

